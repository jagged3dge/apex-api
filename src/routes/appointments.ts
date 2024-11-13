import express from 'express'
import { AppointmentService } from '../services/appointmentService'
import { validateDateQuery } from '../middleware/validation'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const appointmentService = new AppointmentService()

router.get('/', authenticateToken, validateDateQuery, async (req, res) => {
  try {
    const weekStart = req.query.week as string
    const appointments = await appointmentService.getAppointmentsByWeek(
      weekStart,
    )
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

router.post('/', authenticateToken, async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body)
    res.status(201).json(appointment)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' })
  }
})

export default router
