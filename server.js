require('./src/utils/loadConf.js');

const { UrlController } = require('./src/controllers/UrlController.js');
const { ClientController } = require('./src/controllers/ClientController.js');
const { router } = require('./lib/router.js');

router()
  .get({
    name: 'get_index',
    path: '//',
    handler: ClientController.index,
  })
  .get({
    name: 'get_asset',
    path: '/public/:file',
    handler: ClientController.static,
  })
  .get({
    name: 'get_urlRedirection',
    path: '/u/:id',
    handler: ClientController.redirect,
  })
  .get({
    name: 'get_allUrls',
    path: '/api/urls',
    handler: UrlController.all,
  })
  .post({
    name: 'post_newUrl',
    path: '/api/urls',
    handler: UrlController.create,
  })
  .get({
    name: 'get_singleUrl',
    path: '/api/urls/:id',
    handler: UrlController.byId,
  })
  .listen(process.env.PORT || 1337, () => {
    console.log('server listens on', process.env.PORT || 1337);
  });