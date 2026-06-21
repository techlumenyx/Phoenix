const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react/plugins/with-react');
const { DefinePlugin } = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact({ svgr: true }),
  (config) => {
    // Inject all CL_* env vars at build time
    const clEnvVars = Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('CL_'))
        .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
    );
    config.plugins.push(new DefinePlugin(clEnvVars));

    // Bundle analyzer — opt-in only via ANALYZE=true, never runs in CI
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    // Manual vendor chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'vendor-react',
            chunks: 'all',
          },
          apollo: {
            test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
            name: 'vendor-apollo',
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'vendor-firebase',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  }
);
