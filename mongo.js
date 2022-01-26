const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const givenName = process.argv[3]
const givenNumber = process.argv[4]


const url =
  `mongodb+srv://fullstack:${password}@cluster0.euikd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
})


const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log("Phonebook:")
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name + " " + person.number)
        })
        mongoose.connection.close()
    })    
}
 
else if (process.argv.length === 4) {
    console.log("Please give a number too.")
    mongoose.connection.close()
}

else{
    const person = new Person({
        name: givenName,
        number: givenNumber,
        id: Math.floor(Math.random() * 1000000)
    })

    person.save().then(result => {
        console.log("Added " + givenName + " number " + givenNumber + " to phonebook")
        mongoose.connection.close()
    })
}

