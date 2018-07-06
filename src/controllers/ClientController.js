const { resolve } = require('path');

const { renderFile } = require('../utils/renderFile.js'); 
const { url } = require('../model/url.js');

const ClientController = module.exports.ClientController = {

  index(_, res) {
    renderFile(res)(resolve(__dirname, '..', 'public', 'index.html'));
  },

  static({ params: { file } }, res) {
    renderFile(res)(resolve(__dirname, '..', 'public', file))
  },

  redirect({ params: { id } }, res) {
    url()
      .then(db => db.byId(id))
      .then(({ url }) => {
        res.writeHead(200, 'ok', {
          'Refresh': `0; url=${url}`,
          'Content-Type': 'text/html',
        });
        res.end(
          `Please follow <a href="${url}">${url}</a>`,
        );
      })
      .catch((e) => {
        if (e === 'not found') {
          res.writeHead(404);
          res.end('Not Found');
          return
        }
        throw e;
      });
  }

};
