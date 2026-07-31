import type { ILocation } from '../models/location.model';

export function normalizeLocationSearch(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function makeLocationPrefixes(value: string, maxLength = 24): string[] {
  const normalized = normalizeLocationSearch(value);
  const result: string[] = [];
  for (let length = 2; length <= Math.min(normalized.length, maxLength); length += 1) {
    result.push(normalized.slice(0, length));
  }
  return result;
}

export function makeLocationTrigrams(value: string): string[] {
  const normalized = `  ${normalizeLocationSearch(value)}  `;
  const trigrams = new Set<string>();
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    trigrams.add(normalized.slice(index, index + 3));
  }
  return [...trigrams];
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

export function rankLocation(location: ILocation, rawQuery: string): number {
  const query = normalizeLocationSearch(rawQuery);
  const names = location.normalizedNames.length
    ? location.normalizedNames
    : [normalizeLocationSearch(location.name), normalizeLocationSearch(location.asciiName)];
  const bestNameScore = Math.min(...names.map((name) => {
    if (name === query) return 0;
    if (name.startsWith(query)) return 10 + (name.length - query.length) / 100;
    if (name.includes(query)) return 25 + name.indexOf(query);
    return 50 + editDistance(name.slice(0, Math.max(query.length, 1)), query);
  }));
  const populationBoost = Math.min(Math.log10(Math.max(location.population, 1)), 8) / 10;
  return bestNameScore - populationBoost;
}
