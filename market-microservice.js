const MicroMQ = require('micromq');
const ItemModel = require('./mongodb');

const app = new MicroMQ({
    name: 'market',
    rabbit: {
        url: process.env.RABBIT_URL
    }
});

app.post('/market/buy/:id', async (req, res) => {
    const {id} = req.params;

    const item = await ItemModel.findOne({id, isSold: false});

    if (!item) {
        return res.status(404).json({
            error: 'Item not found'
        });
    }

    await ItemModel.findByIdAndUpdate(id, {
        $set: {
            isSold: true
        }
    });

    req.app.ask('notification', {
        server: {
            action: 'notify',
            meta: {
                userId: item.sellerId,
                text: JSON.stringify({
                    event: 'notification',
                    data: {
                        text: `Item ${id} was sold!`
                    }
                })
            }
        }
    })
    .catch(e => console.log(`Cannot send message via notifications microservice`, e));

    res.json({
        ok: true
    });

});

app.start();
