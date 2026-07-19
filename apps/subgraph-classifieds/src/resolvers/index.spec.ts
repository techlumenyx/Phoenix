import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('classifieds federation resolvers', () => {
  it('composes every Organisation field resolver', () => {
    const resolverSource = readFileSync(join(__dirname, 'index.ts'), 'utf8');

    expect(resolverSource).toContain(
      'Organisation:    { ...jobResolvers.Organisation, ...marketplaceResolvers.Organisation }',
    );
  });
});
