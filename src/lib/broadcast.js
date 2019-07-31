const WebSocket = require('ws');
const { renderPublicModel } = require('./utils/general');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('successful websocket connection');
  ws.send('successful websocket connection');
});

/**
 * broadcast a message to clients containing model and method info
 * @param {object} model - an instance of a model that needs to be broadcast to clients
 * @param {object} schema - the schema spec for the model
 * @param {string} method - request method
 * @returns 
 */
exports.send = (model, schema, method) => {
  const renderedModel = renderPublicModel(model, schema)
  const message = JSON.stringify({
    id: model.id,
    method: method,
    model: renderedModel,
  });
    
  console.log(`WS: sending ${message} to clients`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}