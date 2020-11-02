const Gateway = require('micromq/gateway');

const gateway = new Gateway({
    microservices: ['market'],
    rabbit: {
        url: process.env.RABBIT_URL
    }
});

gateway.post('/market/buy/:id', (req, res) => res.delagate('market'));

gateway.listen(process.env.PORT);