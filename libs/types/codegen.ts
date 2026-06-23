import type { CodegenConfig } from '@graphql-codegen/cli';
import path from 'path';

const config: CodegenConfig = {
  schema: [
    path.join(__dirname, '../../apps/subgraph-identity/src/schema/identity.graphql'),
    path.join(__dirname, '../../apps/subgraph-events/src/schema/events.graphql'),
    path.join(__dirname, '../../apps/subgraph-classifieds/src/schema/classifieds.graphql'),
    path.join(__dirname, '../../apps/subgraph-admin/src/schema/admin.graphql'),
  ],
  generates: {
    [path.join(__dirname, 'src/lib/generated/graphql.ts')]: {
      plugins: ['typescript'],
      config: {
        skipTypename: false,
        enumsAsConst: true,
        avoidOptionals: false,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
