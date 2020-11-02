const MicroMQ = require('micromq');
const WebSocket = require('ws');

const app = new MicroMQ({
    name: 'notifications',
    rabbit: {
        url: process.env.RABBIT_URL
    }
});

const ws = new WebSocket.Server({
    port: process.env.PORT
});

const clients = new Map();

ws.on('connection', (connection) => {
    connection.on('message', (message) => {
        const { event, data } = JSON.parse(message);

        if (event === 'authorize' && data.userId) {
            clients.set(data.userId, connection);
        }
    })
});

ws.on('close', () => {
    clients.clear()
});

app.action('notify', (meta) => {
    if (!meta.userId || !meta.text) {
        return [400, { error: 'Bad data' }];
    }

    const connection = clients.get(meta.userId);

    if (!connection) {
        return [404, { error: 'User not found' }];
    }

    connection.send(meta.text);

    return { ok: true };

});

app.start();
