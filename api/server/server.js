var express = require('express')
var bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose.js')
var {Todo} = require('./models/todo.js')
var {Users} = require('./models/user.js')

var app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  // console.log(req.body); 
  var todo = new Todo({
    text: req.body.text
  })

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }, (err) => {
    res.status(400).send(err)
  })
})

app.get('/todos/:id', (req, res) => {
  var id = req.params.id
  // res.send(req.params)
  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(400).send()
    }

    res.send({todo})

  }).catch((e) => {
    res.status(400).send()
  })
})

app.listen(3000, () => {
  console.log('started server on port 3000')
})

module.exports = {app}