import { PORT } from './utils/config.ts'
import app from './app.ts'

app.listen(PORT, () => {
  console.log('listening on port ', PORT)
})
