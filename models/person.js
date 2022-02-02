const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minlength: [3, 'Name must be at least 3 characters long'],
      required: true
    },
    number: {
      type: String,
      validate: {
        validator: function(v) {
          let numV = new RegExp(/(?=\d{2,3}\-\d{1,})(?=[-\d]{8,})/)
          return numV.test(v)
        },
        message: 'Invalid number!'
      },
      required: true
    },
    id: Number,
})




personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
