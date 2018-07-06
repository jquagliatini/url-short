const { createReadStream } = require('fs');

const renderFile = module.exports.renderFile = (res) =>
  (
    file,
    {
      headers = {},
      statusCode = 200,
      status = 'ok',
    } = {}
  ) => {

  const extensions = {
    html: 'text/html',
    js: 'application/javascript',
    json: 'application/json',
    css: 'text/css',
    'jpe?g': 'image/jpeg',
    png: 'image/png',
    '*': 'text/plain',
  }

  const mime =
    Object.keys(extensions)
      .find(extension => RegExp('\\.' + extension + '$', 'i')
      .test(file))

  res.writeHead(statusCode, status, { ...headers, 'Content-Type': mime });
  createReadStream(file).pipe(res);
};