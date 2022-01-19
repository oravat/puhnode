const { response } = require('express')
const express = require('express')
const { token } = require('morgan')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())

let persons = [
    { name: 'Arto Hellas', number: '040-123456', id: '1'},
    { name: 'Ada Lovelace', number: '39-44-5323523', id: '2'},
    { name: 'Dan Abramov', number: '12-43-234345', id: '3' },
    { name: 'Mary Poppendieck', number: '39-23-6423122', id: '4' }
]

app.use(express.json())
console.log('start')
morgan.token('namet', function (req, res) { return JSON.stringify(req.body)})

app.use(morgan(function (tokens, req, res) {
    if(tokens.method(req, res) === POST){
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
    response.send('Phonebook has info for ' + persons.length + ' people' + '<br/> ' + Date())
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})
  

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).json({
            error: 'person not found'
        }) 
    }   
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    }
    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }
    if (persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())){
        return response.status(400).json({ 
            error: 'person already exists' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 10000000 + 5),
    }
    persons = persons.concat(person)
    return response.json(person)
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
