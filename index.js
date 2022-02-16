require('dotenv').config()

require('express')
const express = require('express')
require('morgan')
const morgan = require('morgan')
const app = express()
require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())

console.log('start')
morgan.token('namet', function (req, res) {
  if(res){
    return JSON.stringify(req.body)
  }
})
app.use(morgan(function (tokens, req, res) {
  if(tokens.method(req, res) === 'POST'){
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.namet(req, res)
    ].join(' ')
  }
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    response.send('Phonebook has info for ' + count + ' people' + '<br/> ' + Date())
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(person => {
    if (person) {
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/all', (request, response, next) => {
  Person.deleteMany().then(person => {
    if (person) {
      console.log(response)
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return null
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const re = new RegExp( body.name, 'i')

  Person.find({ name: re }, function(err, result){
    if(result.length !== 0){
      return response.status(400).json({
        error: 'name in use'
      })
    }
    else{
      const person = new Person ({
        name: body.name,
        number: body.number,
      })
      person.save().then(savedPerson => {
        response.json(savedPerson)

      })
        .catch(error => next(error))
    }
  })

})

app.put('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndUpdate(request.params.id, request.body, { runValidators: true, returnDocument: 'after' }).then(person => {
    if (person) {
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
        .catch(error => next(error))

    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
  return response.status(400).send({ 'new error' : error.message })
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
