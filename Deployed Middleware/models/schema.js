var mongoose = require('mongoose');
var schema = mongoose.Schema({
    lightID: String,
    value: Boolean
});
module.exports = schema;