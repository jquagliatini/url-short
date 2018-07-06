const { parse: parseUrl } = require('url');

const trimTrailingSlash = s => s.replace(/\/$/, '');

const match = ({
  method,
  path,
  req
}) => {

  if (method !== '*'
    && req.method.toLowerCase() !== method.toLowerCase()
  ) {
    return false;
  }

  if (path === '*') return true;

  const reqPath = parseUrl(req.url).pathname;

  const pathRe =
    '^'
    + trimTrailingSlash(path)
        .replace(/\:.+?\b/g, '.+?')
        .replace(/\//g, '\\/')
    + '$';

  return new RegExp(pathRe).test(reqPath);
};

const getPathParams = path =>
  path.split('/').filter(c => c.startsWith(':')).map(c => c.slice(1));

const getParams = ({
  url,
  path
}) => {

  if (path === '*') return {};

  const keys = getPathParams(path);

  const catchRe = '^'
    + path
        .replace(/\/$/, '')
        .replace(/\:.+?\b/g, '(.+?)')
    + '$';

  const [_, ...groups] = new RegExp(catchRe).exec(parseUrl(url).pathname);

  return groups.reduce(
    (obj, key, i) => ({
      ...obj,
      [keys[i]]: key,
    }),
    {}
  );
};

const route = module.exports.route = ({
  name,
  handler,
  path = '*',
  method = '*',
} = {}) => {
  return {
    get name() {
      return name;
    },
    match(req) {
        return match({ method, path, req });
    },
    run(req, res) {
      return handler(
        Object.assign(
          req, 
          { params: getParams({ url: req.url, path }) }
        ),
        res
      );
    },
    url(params = {}) {
      const keys = getPathParams(path);

      for (const key of keys) {
        if (!params.hasOwnProperty(key)) {
          throw new Error(`missing key '${key}'`);
        }
      }

      return keys.reduce(
        (newPath, key) => newPath.replace(new RegExp(`\:${key}`), params[key]),
        path,
      );
    }
  };
};