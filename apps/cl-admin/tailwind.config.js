const path = require('path');

module.exports = {
  content: [path.resolve(__dirname, './src/**/*.{tsx,ts,html}')],
  theme: { extend: {} },
  plugins: [],
};
