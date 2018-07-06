const { createServer } = require('http');

const { route } = require('./route.js');

const log = (req, res) => {
  console.log(
    `\x1b[${res.statusCode > 299 ? 31 : 32}m%d\x1b[0m [%s] %s`,
    res.statusCode,
    req.method,
    req.url,
  );
};

const runAndIdentity = (toRun, identity) => {
  return d => { toRun(d); return identity; };
}

const router = module.exports.router = () => {
  const routes = [];
  const method = (method) => description => {
    routes.push(
      route(
        {
          ...description,
          method,
        },
      ),
    );
  }

  const notFoundRoute = route(
    {
      name: 'default',
      handler(_, res) {
        res.writeHead(404);
        res.end('Not Found');
      },
    },
  );

  const tmp = ['get', 'post', 'put', 'patch', 'option']
    .reduce(
      (obj, verb) => ({ ...obj, [verb]: method(verb) }),
      {
        listen(port, cb = () => {}) {
          createServer((req, res) => {
            const found = routes.find(r => r.match(req));
            req.router = tmp;
            try {
              (found || notFoundRoute)
                .run(
                  req,
                  res
                );
            } catch (e) {
              console.error(e);
              res.writeHead(500);
              res.end('Server Error');
            }

            log(req, res);
          }).listen(port);
          cb();
        },
        url(name, params) {
          const r = routes.find(r => r.name === name)

          return r
            ? r.url(params)
            : '';
        }
      }
    );

  Object.keys(tmp)
    .forEach(key => {
      if (key !== 'listen' && key !== 'url')
        tmp[key] = runAndIdentity(tmp[key], tmp);
    });

  return tmp;
};