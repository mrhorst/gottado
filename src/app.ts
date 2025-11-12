import express from 'express'

import api from './routes/index.ts'

const app = express()

app.use(express.json())
app.use('/api', api)

app.get('/', (req, res) => {
  res.send('ok')
})

export default app
