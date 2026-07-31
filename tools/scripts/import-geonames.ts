import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { createMongoConnection } from '../../libs/db/src';
import { LocationSchema } from '../../apps/subgraph-identity/src/models/location.model';
import {
  normalizeLocationSearch,
} from '../../apps/subgraph-identity/src/lib/location-search';

function argument(name: string, required = true): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (required && (!value || value.startsWith('--'))) throw new Error(`Missing --${name}`);
  return value;
}

async function readCodeNames(file: string | undefined, keyColumn: number, nameColumn: number) {
  const values = new Map<string, string>();
  if (!file) return values;
  const lines = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const columns = line.split('\t');
    const key = columns[keyColumn]?.trim();
    const name = columns[nameColumn]?.trim();
    if (key && name) values.set(key, name);
  }
  return values;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const citiesFile = argument('cities')!;
  const countryFile = argument('countries', false);
  const admin1File = argument('admin1', false);
  const admin2File = argument('admin2', false);
  const minPopulation = Number(argument('min-population', false) ?? '15000');
  if (!Number.isFinite(minPopulation) || minPopulation < 0) {
    throw new Error('--min-population must be a non-negative number');
  }
  const mongoUri = argument('mongo-uri', false) ?? process.env['MONGODB_URI'];
  if (!mongoUri) throw new Error('Set MONGODB_URI or pass --mongo-uri');

  const [countries, admin1Names, admin2Names] = await Promise.all([
    readCodeNames(countryFile, 0, 4),
    readCodeNames(admin1File, 0, 1),
    readCodeNames(admin2File, 0, 1),
  ]);

  const connection = await createMongoConnection(mongoUri, 'cl_identity');
  const Location = connection.model('Location', LocationSchema);
  const lines = createInterface({ input: createReadStream(citiesFile, 'utf8'), crlfDelay: Infinity });
  let operations: Array<Record<string, unknown>> = [];
  let imported = 0;

  async function flush() {
    if (!operations.length) return;
    await Location.bulkWrite(operations as never[], { ordered: false });
    imported += operations.length;
    operations = [];
    process.stdout.write(`\rImported ${imported.toLocaleString()} locations`);
  }

  for await (const line of lines) {
    if (!line) continue;
    const columns = line.split('\t');
    const geonameId = Number(columns[0]);
    const name = columns[1]?.trim();
    const asciiName = columns[2]?.trim() || name;
    const countryCode = columns[8]?.trim().toUpperCase();
    const population = Number(columns[14]) || 0;
    if (!geonameId || !name || !countryCode || population < minPopulation) continue;

    const admin1Code = columns[10]?.trim() || null;
    const admin2Code = columns[11]?.trim() || null;
    const admin1Key = admin1Code ? `${countryCode}.${admin1Code}` : '';
    const admin2Key = admin2Code ? `${countryCode}.${admin1Code}.${admin2Code}` : '';
    const countryName = countries.get(countryCode)
      ?? new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode)
      ?? countryCode;
    const admin1Name = admin1Names.get(admin1Key) ?? null;
    const admin2Name = admin2Names.get(admin2Key) ?? null;
    const displayParts = unique([name, admin2Name ?? '', admin1Name ?? '', countryName]);

    const aliases = (columns[3] ?? '').split(',').map((value) => value.trim()).filter(Boolean).slice(0, 20);
    const normalizedNames = unique([name, asciiName, ...aliases].map(normalizeLocationSearch));
    const normalizedName = normalizeLocationSearch(asciiName);
    const id = `geonames:${geonameId}`;

    operations.push({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            geonameId,
            name,
            asciiName,
            displayName: displayParts.join(', '),
            countryCode,
            countryName,
            admin1Code,
            admin1Name,
            admin2Code,
            admin2Name,
            latitude: Number(columns[4]),
            longitude: Number(columns[5]),
            population,
            featureCode: columns[7] || 'PPL',
            timezone: columns[17] || null,
            normalizedName,
            normalizedNames,
            active: true,
          },
        },
        upsert: true,
      },
    });
    if (operations.length >= 1_000) await flush();
  }
  await flush();
  process.stdout.write('\nGeoNames import complete.\n');
  await connection.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
