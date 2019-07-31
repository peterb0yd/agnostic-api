
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// ! NOTE: NEEDS ENCRYPTION


/**
 * sign - create a new token 
 * @param {string} appName - the front-end client name, we use it's secret password in the config
 * @param {string} data - the data that gets embedded into the token
 * @param {string} expires - the expiration time, default is one day ("1d")
 * @returns {string} JWT - the signed token
 */
exports.sign = (appName, data, expiresIn = '1d')=> {
  const {secretPassword} = config.APPS[appName];
  return jwt.sign({ data }, secretPassword, {expiresIn});
};

/**
 * verify - verify a token
 * @param {string} appName - the front-end client name, we use it's secret password in the config
 * @param {string} token - the JWT token to check
 * @returns {object} data - the deconstructed data object
 */
exports.verify = (appName, token)=> {
  console.log({config, appName});
  const {secretPassword} = config.APPS[appName];
  return jwt.verify(token, secretPassword);
};