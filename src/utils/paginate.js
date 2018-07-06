const { parse: qs } = require('querystring');

const paginate = module.exports.paginate = (req) => {
  const { page = 1, per_page = 20 } = qs(req.url.split('?')[1]);

  return { page, perPage: per_page };
};
