import type { CodegenConfig } from '@graphql-codegen/cli';
import path from 'path';

const config: CodegenConfig = {
  schema: path.join(__dirname, 'src/schema/admin.graphql'),
  generates: {
    [path.join(__dirname, 'src/generated/resolvers.generated.ts')]: {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        federation: true,
        contextType: '../context#GraphQLContext',
        useIndexSignature: true,
        enumsAsConst: true,
        avoidOptionals: false,
      },
    },
  },
};

export default config;
