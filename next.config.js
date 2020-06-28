module.exports = {
  target: "serverless",
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    config.externals = {
      ...config.externals,
      canvas: "commonjs canvas",
    };

    return config;
  },
};
