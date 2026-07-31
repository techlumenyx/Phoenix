# GeoNames location catalogue

Christian Listings uses a self-hosted copy of the GeoNames `cities500` dataset. The browser and API do not call the public GeoNames service during normal traffic.

## Data files

Download and extract these files from <https://download.geonames.org/export/dump/>:

- `cities500.zip` → `cities500.txt`
- `countryInfo.txt`
- `admin1CodesASCII.txt`
- `admin2Codes.txt`

The three reference files are optional, but supplying them produces complete labels such as `Manchester, England, United Kingdom` instead of code-only hierarchy values.

## Import

Run the importer from a development checkout with dependencies installed. It connects through `createMongoConnection`, writes only to `cl_identity.locations`, and safely upserts by the stable `geonames:<id>` key.

```bash
npm run locations:import -- \
  --cities ./tmp/geonames/cities500.txt \
  --countries ./tmp/geonames/countryInfo.txt \
  --admin1 ./tmp/geonames/admin1CodesASCII.txt \
  --admin2 ./tmp/geonames/admin2Codes.txt
```

The command reads `MONGODB_URI`. To target production deliberately, pass the URI explicitly from a protected shell session:

```bash
npm run locations:import -- \
  --mongo-uri "$MONGODB_URI" \
  --cities ./tmp/geonames/cities500.txt \
  --countries ./tmp/geonames/countryInfo.txt \
  --admin1 ./tmp/geonames/admin1CodesASCII.txt \
  --admin2 ./tmp/geonames/admin2Codes.txt
```

Do not commit the downloaded dump or put the MongoDB URI in shell history, source control, or deployment logs.

## Runtime behaviour

- Empty searches return globally popular cities.
- Prefix matches use precomputed, indexed prefixes.
- Misspellings use indexed trigrams to find a bounded candidate set, then rank candidates in memory.
- Exact matches rank first; population is only a tie breaker.
- Guests store the selected display location in local storage.
- Signed-in users store the canonical GeoNames ID in `User.regionCode` and the human-readable label in `User.region`.
- Public directories first try the selected city. When that result is empty, they broaden to all locations and show a visible explanation.

## Attribution and refresh

GeoNames data is licensed under CC BY 4.0. The location selector displays `Location data © GeoNames`; retain that attribution in every replacement UI.

Refresh the catalogue periodically by downloading a new dump and rerunning the same idempotent import command. Existing GeoNames IDs remain stable. A future maintenance task should mark records absent from a newer dump inactive after the new import has completed successfully.

## Deployment order

1. Import GeoNames into the target `cl_identity` database.
2. Deploy the identity subgraph containing the `Location` schema and query.
3. Recompose and deploy the gateway supergraph.
4. Deploy the public frontend.
5. Smoke-test an exact search (`Manchester`), a typo (`Manchseter`), a duplicated city name, guest persistence, and signed-in profile persistence.

Deploying the frontend before importing the catalogue leaves the selector empty, so the import is a required release step.
