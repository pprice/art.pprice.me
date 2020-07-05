module.exports = {
  target: "serverless",
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    config.externals.push({
      canvas: {}, // "commonjs canvas",
    });

    return config;
  },
};
