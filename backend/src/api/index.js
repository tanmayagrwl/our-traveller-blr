const express = require('express');
const { default: setupPubSubService } = require('../loaders/pubsub');

// const { publishMessage } = await setupPubSubService();
// await publishMessage({ text: 'This is a test message', timestamp: new Date().toISOString() });
// console.log('Test message published');

module.exports = () => {
  const app = express.Router();

  //TODO: add routes here...

  return app;
};
