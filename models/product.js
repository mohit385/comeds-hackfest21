const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: true
    },
    price: {
        type: Number,
        default: 0.0,
        required: true
    },
    detail: {
        type: String,
        default: '',
        required: false
    },
    qtyAvl: {
        type: Number,
        default: 0,
        required: true
    },
    images: [{
        url: String,
        filename: String
    }],
    category: {
        type: String,
        enum: ['medicine', 'oxygen-cylinder', 'equipments'],
        default: 'medicine'
    },
    cityOfPresence: {
        type: String,
        required: true,
        default: ''
    },
    owner: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        ownerName: String
    }
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product