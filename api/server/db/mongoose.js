const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('process.ENV.MONGODB_URI' || 'mongodb://localhost:27017/TodoApp', { useNewUrlParser: true })

module.exports = {mongoose}