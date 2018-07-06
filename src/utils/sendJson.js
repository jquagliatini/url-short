const sendJson = module.exports.sendJson = (res) => ({
  data,
  statusCode = 200,
  status = 'Ok',
  pretty = false,
  headers = {},
} = {}) => {
  const headersToSend = {
    ...headers,
    'Content-Type': 'application/json',
  };

  res.writeHead(statusCode, status, headersToSend);
  res.end(
    JSON.stringify(
      data,
      null,
      pretty ? 2 : 0
    ),
  );
}