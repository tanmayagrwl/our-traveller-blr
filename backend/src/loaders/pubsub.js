const { PubSub } = require('@google-cloud/pubsub');
const WebSocket = require('ws');

// Topic and subscription names
const topicName = 'websocket-notifications';
const subscriptionName = 'websocket-subscription';

// WebSocket endpoint
const WS_ENDPOINT = 'ws://localhost:5000';

// Create a PubSub client
// Note: This assumes you have set up Google Cloud credentials
// via GOOGLE_APPLICATION_CREDENTIALS environment variable
const pubSubClient = new PubSub();

async function setupPubSubService() {
    try {
        // Create topic if it doesn't exist
        let [topicExists] = await pubSubClient.topic(topicName).exists();
        if (!topicExists) {
            console.log(`Creating topic: ${topicName}`);
            await pubSubClient.createTopic(topicName);
        }
        console.log(`Topic ${topicName} is ready`);

        // Create subscription if it doesn't exist
        const topic = pubSubClient.topic(topicName);
        let [subscriptionExists] = await topic.subscription(subscriptionName).exists();
        if (!subscriptionExists) {
            console.log(`Creating subscription: ${subscriptionName}`);
            await topic.createSubscription(subscriptionName);
        }
        console.log(`Subscription ${subscriptionName} is ready`);

        // Create a publisher function for easy publishing
        const publishMessage = async (message) => {
            try {
                const messageBuffer = Buffer.from(JSON.stringify(message));
                const messageId = await topic.publish(messageBuffer);
                console.log(`Message ${messageId} published`);
                return messageId;
            } catch (error) {
                console.error('Error publishing message:', error);
                throw error;
            }
        };

        // Set up the subscription handler to connect to WebSocket
        const subscription = topic.subscription(subscriptionName);

        subscription.on('message', async (message) => {
            try {
                console.log(`Received message: ${message.id}`);
                console.log(`Data: ${message.data.toString()}`);

                // Connect to WebSocket and send "hey"
                const ws = new WebSocket(WS_ENDPOINT);

                ws.on('open', () => {
                    console.log('WebSocket connection established');
                    // Send the "hey" message
                    ws.send('hey');
                    console.log('Sent "hey" message to WebSocket');

                    // Close the connection after sending
                    setTimeout(() => {
                        ws.close();
                        console.log('WebSocket connection closed');
                    }, 1000);
                });

                ws.on('message', (data) => {
                    console.log('Message from WebSocket server:', data.toString());
                });

                ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                });

                // Acknowledge the message to remove it from the queue
                message.ack();
            } catch (error) {
                console.error('Error processing message:', error);
                // Don't acknowledge on error to allow retrying
            }
        });

        console.log(`Listening for messages on ${subscriptionName}`);

        // Return the publish function to allow easy publishing
        return { publishMessage };
    } catch (error) {
        console.error('Error setting up Pub/Sub service:', error);
        throw error;
    }
}

export default setupPubSubService;