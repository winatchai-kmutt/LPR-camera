const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    regis: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    timeIn: {
        type: String,
        required: false,
    },
    timeOut: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
    },
    carImage: {
        type: String,
        required: true
    },
    plateNumber: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('Posts', PostSchema);