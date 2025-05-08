const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/admin',
    createProxyMiddleware({
      target: 'http://193.136.62.78:8000',
      changeOrigin: true,
      secure: true,
      pathRewrite: (path, req) => {
        console.log('Original path:', path);
        return path.replace('/admin', '/');
      }
    })
  );
  
  app.use(
    '/real-time-data',
    createProxyMiddleware({
      target: 'http://193.136.62.78:8000',
      changeOrigin: true,
      secure: true,
      pathRewrite: (path, req) => {
        console.log('Original path:', path);
        return path.replace('/', '/real-time-data/');
      }
    })
  );
};