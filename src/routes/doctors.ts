import express from 'express'
import { DoctorService } from '../services/doctorService'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const doctorService = new DoctorService()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors()
    res.json(doctors)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' })
  }
})

export default router
