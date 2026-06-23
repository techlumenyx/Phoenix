import type { CodegenConfig } from '@graphql-codegen/cli';
import path from 'path';

const config: CodegenConfig = {
  schema: [
    path.join(__dirname, '../../apps/subgraph-identity/src/schema/identity.graphql'),
    path.join(__dirname, '../../apps/subgraph-events/src/schema/events.graphql'),
    path.join(__dirname, '../../apps/subgraph-classifieds/src/schema/classifieds.graphql'),
    path.join(__dirname, '../../apps/subgraph-admin/src/schema/admin.graphql'),
  ],
  documents: ['apps/christian-listing/src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    [path.join(__dirname, 'src/generated') + '/']: {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
};

export default config;
