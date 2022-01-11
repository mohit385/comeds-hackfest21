const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    isSeller: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        default: ''
    },
    boughtProducts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    createdProducts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User