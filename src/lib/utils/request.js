// * Request functions - set variables on the `req` object
const {pick} = require('./general');
const config = require('../../config');

exports.getAppName = function (hostname) {
    // TEMP FOR DEV
    hostname = hostname.toUpperCase().replace('-','_');
    // let TEMP_HOSTNAME = hostname;
    let TEMP_HOSTNAME = 'dev-dreamydc';   // ! TEMPORARY FOR DEV
    // let TEMP_HOSTNAME = 'toprocklabs';   // ! TEMPORARY FOR DEV
    TEMP_HOSTNAME = TEMP_HOSTNAME.toUpperCase().replace('-','_');
    return TEMP_HOSTNAME;
    return hostname;
}

const getPathParts = path => path.split(/\//).filter(v=>!!v);
exports.getPathParts = getPathParts;

exports.getModelName = function (path) { 
    return getPathParts(path)[0];
}

exports.getModelIndexes = function ({fields}) {
    return Object.keys(fields).filter(key => fields[key].index);
}

exports.getRandomNumCode = function (length) {
    const randInt = Math.round(Math.random() * 10**length).toString();
    return randInt.padStart(length, '0');
}

exports.getInstanceFromBody = function ({instanceModel, body}) {
    const modelKeys = Object.keys(instanceModel.fields);
    return pick(modelKeys, body);
}

exports.getInstanceModel = function ({appName, modelName}) {
    const schemaFilename = config.SCHEMAS[appName];
    if (!schemaFilename) throw new Error('Schema not found');
    const schema = require(`../../config/${schemaFilename}`); // pull schema 
    const instanceModel = schema[modelName];
    if (!instanceModel) throw new Error(`${modelName} model not found`);
    return instanceModel;
}