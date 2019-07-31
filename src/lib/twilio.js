
const twilio = require('twilio');
const config = require('../config/env');

const clients = {};

const getClient = ({client, mainNumber})=> {
  return {
    sendText: async function ({phoneNumber, verifyMsg, code}) {
        try { 
            if (code) verifyMsg = verifyMsg.replace(/\$CODE/, code);
            return client.messages.create({
                to: phoneNumber,
                from: mainNumber,
                body: verifyMsg
            });
        } 
        catch (error) {
            throw error;
        }
    }
  };
}

Object.entries(config.APPS).map(([name, app])=> {
    if (!app.TWILIO) return;
    const {ssid, auth, mainNumber} = app.TWILIO;
    const client = twilio(ssid, auth);
    clients[name] = getClient({
        client, 
        mainNumber
    });
});

module.exports = clients;