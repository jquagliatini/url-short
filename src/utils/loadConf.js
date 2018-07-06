const { readFileSync } = require('fs');
const { resolve } = require('path');
const { EOL } = require('os');

const confJson = () => {
  const conf = {};
  const confContent = readFileSync(
    resolve(__dirname, '..', '..', 'config.json'),
  ).toJSON().data;

  Object.keys(confContent)
    .forEach(key => {
      process.env[key] = confContent[key];
      conf[key] = confContent[key];
    });
  return conf;
}

const dotEnv = () => {
  const conf = {};
  const dotEnvContent = readFileSync(
    resolve(__dirname, '..', '..', '.env')
  ).toString();

  dotEnvContent.split(EOL)
    .forEach((line) => {
      const elts = line
        .split('=')
        .map(x => x.trim());
      process.env[elts[0]] = elts[1];
      conf[elts[0]] = elts[1];
    });
  return conf;
}

const tryCatchIgnoreEnoent = fn => {
  try {
    return fn();
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

const loadConf = module.exports.loadConf = (() => {
  const conf = Object.assign(
    {},
    tryCatchIgnoreEnoent(confJson),
    tryCatchIgnoreEnoent(dotEnv)
  );

  return () => {}
})()