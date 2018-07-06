const { URL } = require('url');

const { url } = require('../model/url.js');
const { sendJson } = require('../utils/sendJson');
const { paginate } = require('../utils/paginate.js');
const { paginationHeaders } = require('../utils/paginationHeaders.js');

const UrlController = module.exports.UrlController = {

  async all(req, res) {

    const { page = 1, perPage = 20 } = paginate(req);

    const db = await url();
    const total = await db.count();

    const start = perPage * (page - 1);

    if (total !== 0 && start >= total) {
      res.writeHead(404);
      res.end(`No Url Found on page ${page}`);
      return;
    }

    const urls = await db.all(
      start,
      start + perPage
    )
    const data = urls.map(
      url =>
        ({
          ...url,
          _href: req.router.url('get_singleUrl', { id: url._id }),
        })
    );

    const headers = paginationHeaders({
      total,
      page,
      perPage,
    });

    sendJson(res)({ data, headers });
  },

  create(req, res) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {

      const json = JSON.parse(body);

      if (!json.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      try {
        new URL(json.url);
      } catch (e) {
        if (e.code === 'ERR_INVALID_URL') {
          res.writeHead(400);
          res.end('Bad Request - Invalid URL');
          return;
        }
        throw e;
      }

      const db = await url();
      const data = await db.create({ url: json.url });

      sendJson(res)({
        statusCode: 201,
        status: 'Created',
        data,
      });

    });

  },

  async byId(req, res) {
    const id = req.params.id;

    if (!id) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    url()
      .then(db => db.byId(id))
      .then(u => sendJson(res)({ data: u }))
      .catch((e) => {
        if (e === 'not found') {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        throw e;
      });
  },

};