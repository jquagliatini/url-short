const fs = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');
const { createHash } = require('crypto');

const { id } = require('../utils/id.js');

const stats = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const DATA_FILE = resolve(__dirname, 'urls.json');

const url = module.exports.url = (() => {

  const model = ({ urls, cksum }) => {

    const flush = () => {
      const data = JSON.stringify(urls);
      const newCksum = createHash('md5').update(data).digest('hex');
  
      if (cksum === newCksum) { return Promise.resolve(); }
  
      cksum = newCksum;
  
      return writeFile(
        DATA_FILE,
        JSON.stringify({ cksum, urls }),
        'utf8'
      );
    };

    return {
      ready() {
        return urls !== undefined;
      },

      create({ url }) {
        return new Promise((resolve) => {
          const newUrl = {
            _id: id(),
            url,
            created_at: new Date(),
          };
          urls.unshift(newUrl);
          flush();
          return resolve(newUrl);
        });
      },

      count() {
        return new Promise((resolve) => resolve(urls.length));
      },

      all(start = 0, end) {
        return new Promise((resolve) =>
          resolve((urls || []).slice(start, end)),
        );
      },

      byId(id) {
        return new Promise((resolve, reject) => {
          const found = urls.find((u) => u._id === id);
          return found
            ? resolve(found)
            : reject('not found');
        });
      },
    };
  };

  const P = stats(DATA_FILE)
    .then(
      () => Promise.resolve(),
      (e) => {
        if (e.code !== 'ENOENT') throw e;

        return writeFile(
          DATA_FILE,
          JSON.stringify({ cksum: '', urls: [] }),
          'utf8'
        );
      },
    )
    .then(() => readFile(DATA_FILE, 'utf8'))
    .then((content) => JSON.parse(content.toString()));

  return () => P.then(model);
})()