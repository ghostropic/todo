const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp', { useNewUrlParser: true })
.then(() => console.log("connection successful"))
.catch(err => console.log(err));

module.exports = {mongoose}