const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

var {app} = require('./../server')
var {Todo} = require('./../models/todo')

const todos = [{
  text: 'first test todo',
  _id: new ObjectID()
}, {
  text: 'second test todo',
  _id: new ObjectID()
}]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    // must return in order to chain callbacks !
    return Todo.insertMany(todos)
  }).then(() => done())
})

describe('POST /todos', () => {
  it('should  create a new todo', (done) => {
    var text = 'test todo text'

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => { //custom  expect call
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        Todo.find({text: 'test todo text'}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch((e) => done(e))
      })
    })

  it('should not create todo with invalid body data', (done) => { 
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, req) => {
      if (err) {
        return done(err)
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2)
        done()
      }).catch((e) => done(e))
    })
  })
})

describe('GET /todos route', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2)
    })
    .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return a 404 if todo not found', (done) => {
    var unknown_object_id = new ObjectID()
    request(app)
      .get(`/todos/${unknown_object_id.toHexString()}`)
      .expect(400)
      .end(done)
  })

  it('should return a 404 for non-objectids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(400)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  var hexId = todos[1]._id.toHexString()
  it('should remove a todo', (done) => {
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId)
    })
    .end((err, res) => {
      if (err) {
        return done(err)
      }

      Todo.findById(hexId).then((todo) => {
        expect(todo).toBeFalsy()
        done()
      }).catch((e) => done(e))
    })
  })

  it('should return  400 if todo not found', (done) => {
    request(app)
    .delete(`/todos/${new ObjectID()}`)
    .expect(400)
    .end(done)
  })

  it('should return 400 if objectID is invalid', (done) => {
    request(app)
    .delete('/todos/123abc')
    .expect(400)
    .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  var text = 'test todo patch'
  var hexId = todos[1]._id.toHexString()
  it('should update a todo', (done) => {
    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed: true,
      text
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(text)
      expect(res.body.todo.completed).toBe(true)
    })  
    .end(done)
  })

  it('should clear completedAt when not completed', (done) => {
    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed: false,
      text
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(text)
      expect(res.body.todo.completed).toBe(false)
      expect(res.body.todo.completedAt).toBeNull()
    })  
    .end(done)
  })

})