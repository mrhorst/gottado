import express from 'express'
import cors from 'cors'

import api from './routes/index.ts'
import errorHandler from './middleware/error.ts'

const app = express()

app.use(express.json())
app.use(cors())
app.use('/api', api)
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('ok')
})

export default app
