// src/services/appointmentService.ts
import { Appointment } from '../types'
import {
  startOfWeek,
  endOfWeek,
  parseISO,
  addDays,
  setHours,
  setMinutes,
  format,
  addMinutes,
} from 'date-fns'

export class AppointmentService {
  private doctors = [
    { id: '1', name: 'Dr. Smith', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Johnson', specialty: 'Pediatrics' },
    { id: '3', name: 'Dr. Williams', specialty: 'Dermatology' },
  ]

  private patientNames = [
    'John Doe',
    'Jane Smith',
    'Robert Brown',
    'Maria Garcia',
    'James Wilson',
    'Sarah Davis',
    'Michael Miller',
    'Lisa Anderson',
    'William Taylor',
    'Emma Thomas',
    'David Martinez',
    'Jennifer Robinson',
    'Joseph White',
    'Margaret Lee',
    'Charles King',
    'Patricia Wright',
  ]

  private appointments: Record<string, Appointment[]> = {}

  constructor() {
    // Initial appointments will be generated on demand
  }

  private generateAppointmentId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getRandomStatus(): 'confirmed' | 'pending' | 'cancelled' {
    const statuses: ('confirmed' | 'pending' | 'cancelled')[] = [
      'confirmed',
      'pending',
      'cancelled',
    ]
    const weights = [0.7, 0.2, 0.1] // 70% confirmed, 20% pending, 10% cancelled

    const random = Math.random()
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (random < sum) return statuses[i]
    }
    return 'confirmed'
  }

  private getRandomPatient(): string {
    return this.patientNames[
      Math.floor(Math.random() * this.patientNames.length)
    ]
  }

  private getRandomDoctor(): string {
    return this.doctors[Math.floor(Math.random() * this.doctors.length)].id
  }

  private getRandomNotes(): string | undefined {
    const shouldHaveNotes = Math.random() > 0.7 // 30% chance of having notes
    if (shouldHaveNotes) {
      const notes = [
        'Follow-up required',
        'Regular checkup',
        'Prescription renewal',
        'Lab results review',
        'Annual physical',
        'Post-surgery check',
      ]
      return notes[Math.floor(Math.random() * notes.length)]
    }
    return undefined
  }

  private generateDailyAppointments(date: Date): Appointment[] {
    const appointments: Appointment[] = []
    const dayAppointments = Math.floor(Math.random() * 8) + 8 // 8-15 appointments per day

    // Track taken slots to avoid conflicts
    const takenSlots: Set<string> = new Set()

    for (let i = 0; i < dayAppointments; i++) {
      let startTime: Date
      let timeString: string

      // Keep trying until we find an available slot
      do {
        startTime = setHours(date, 9 + Math.floor(Math.random() * 7)) // 9 AM to 4 PM
        startTime = setMinutes(startTime, Math.floor(Math.random() * 2) * 30) // 0 or 30 minutes
        timeString = format(startTime, 'HH:mm')
      } while (takenSlots.has(timeString))

      takenSlots.add(timeString)

      const endTime = addMinutes(startTime, 30)

      appointments.push({
        id: this.generateAppointmentId(),
        patientName: this.getRandomPatient(),
        doctorId: this.getRandomDoctor(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: this.getRandomStatus(),
        notes: this.getRandomNotes(),
      })
    }

    return appointments.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
  }

  private generateWeekAppointments(weekStart: Date): Appointment[] {
    let appointments: Appointment[] = []

    // Generate appointments for each weekday (Monday to Friday)
    for (let i = 0; i < 5; i++) {
      const currentDay = addDays(weekStart, i)
      appointments = [
        ...appointments,
        ...this.generateDailyAppointments(currentDay),
      ]
    }

    return appointments
  }

  async getAppointmentsByWeek(weekStartStr: string): Promise<Appointment[]> {
    const weekStart = startOfWeek(parseISO(weekStartStr), { weekStartsOn: 1 }) // Start on Monday
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    // Generate appointments for this week if not already generated
    const weekKey = format(weekStart, 'yyyy-MM-dd')
    if (!this.appointments[weekKey]) {
      this.appointments[weekKey] = this.generateWeekAppointments(weekStart)
    }

    return this.appointments[weekKey]
  }

  async createAppointment(
    appointment: Omit<Appointment, 'id'>,
  ): Promise<Appointment> {
    const weekStart = startOfWeek(parseISO(appointment.startTime), {
      weekStartsOn: 1,
    })
    const weekKey = format(weekStart, 'yyyy-MM-dd')

    const newAppointment = {
      ...appointment,
      id: this.generateAppointmentId(),
    }

    // Initialize week if not exists
    if (!this.appointments[weekKey]) {
      this.appointments[weekKey] = this.generateWeekAppointments(weekStart)
    }

    // Add new appointment
    this.appointments[weekKey].push(newAppointment)

    // Sort appointments by start time
    this.appointments[weekKey].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    return newAppointment
  }

  // Utility method to check if slot is available
  private isSlotAvailable(
    weekKey: string,
    startTime: string,
    endTime: string,
    doctorId: string,
  ): boolean {
    if (!this.appointments[weekKey]) return true

    return !this.appointments[weekKey].some(
      (apt) =>
        apt.doctorId === doctorId &&
        apt.status !== 'cancelled' &&
        ((new Date(startTime) >= new Date(apt.startTime) &&
          new Date(startTime) < new Date(apt.endTime)) ||
          (new Date(endTime) > new Date(apt.startTime) &&
            new Date(endTime) <= new Date(apt.endTime))),
    )
  }
}
