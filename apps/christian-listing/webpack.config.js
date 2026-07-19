const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react/plugins/with-react');
const { DefinePlugin } = require('webpack');

module.exports = composePlugins(
  withNx(),
  withReact({ svgr: true }),
  (config) => {
    config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
    };

    const clEnvVars = Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => k.startsWith('CL_') || k.startsWith('VITE_'))
        .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
    );
    config.plugins.push(new DefinePlugin(clEnvVars));

    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
  }
);
