
const {unflatten} = require('../lib/utils');
const envs = Object.entries(process.env)
    .filter(([k,v])=> k.match('APPS'))
    .reduce((prev,curr)=> {
        prev[curr[0]]=curr[1];
        return prev;
    },{});

const jsonEnvs = { APPS: unflatten(envs).APPS };
module.exports = jsonEnvs;