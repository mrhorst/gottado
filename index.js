require('dotenv').config()
const express = require('express')

const PORT = process.env.PORT || 3000
const todoRoute = require('./controllers/todo')
const app = express()

app.use('/api/todo', todoRoute)

app.get('/', (req, res) => {
  res.send('ok')
})

app.listen(PORT, () => {
  console.log('listening on port ', PORT)
})
