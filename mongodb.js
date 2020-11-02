const { Schema, model } = require('mongoose');

const ItemSchema = new Schema({
    isSold: Boolean
});

module.exports = model('Item', ItemSchema);