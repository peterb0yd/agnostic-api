
const ses = require('aws-sdk/clients/ses');
const config = require('../config/env');
const emailVerificationMailer = require('../mailers/emailVerification');
const emailContactMailer = require('../mailers/emailContact');
const clients = {};

const getSESClient = ({accessKeyId, secretAccessKey, region, email})=> {
  const client = new ses({
    apiVersion: '2017-03-09',
    accessKeyId,
    secretAccessKey,
    region
  });
  client.email = email;
  client.emailVerificationMailer = emailVerificationMailer;
  client.emailContactMailer = emailContactMailer;
  return client;
}

Object.entries(config.APPS).map(([name, app])=> {
  if (!app.SES) return;
  clients[name] = getSESClient(app.SES);
});

module.exports = clients;