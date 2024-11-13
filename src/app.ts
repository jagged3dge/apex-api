import express from 'express'
import cors from 'cors'
import appointmentsRouter from './routes/appointments'
import doctorsRouter from './routes/doctors'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/appointments', appointmentsRouter)
app.use('/api/doctors', doctorsRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
