export interface Appointment {
  id: string
  patientName: string
  doctorId: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'pending' | 'cancelled'
  notes?: string
}
