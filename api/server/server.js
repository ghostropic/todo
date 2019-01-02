const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose.js')
var {Todo} = require('./models/todo.js')
var {Users} = require('./models/user.js')

var app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

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


app.delete('/todos/:id', (req, res) => {
  var id = req.params.id
  // res.send(req.params)
  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  Todo.findByIdAndDelete(id).then((todo) => {
    if (!todo) {
      return res.status(400).send()
    }

    res.send({todo})

  }).catch((e) => {
    res.status(400).send()
  })
})

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id
  var body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(400).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  } 

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
     //new: true returns updated object
     if (!todo) {
       return res.status(404).send()
     }
     res.send({todo})
  }).catch((e) => {
    res.status(400).send()
  })
})

app.listen(port, () => {
  console.log(`started at ${port}`)
})

module.exports = {app}