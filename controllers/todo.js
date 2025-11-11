const route = require('express').Router()

// Get list of TODOS
route.get('/', (req, res) => {
  res.send(`${req.method} ${req.baseUrl} - OK`)
})

// Get TODO by ID
route.get('/:id', async (req, res, next) => {})

// Add TODO
route.post('/', async (req, res, next) => {
  const body = req.body
})

// update TODO by ID
route.put('/:id', async (req, res, next) => {})

// delete TODO by ID.
// Unsure if we should actually delete it or simply make it 'inactive'
route.delete('/:id', async (req, res, next) => {})

module.exports = route
