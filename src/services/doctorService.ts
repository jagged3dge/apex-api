import { Doctor } from '../types'

export class DoctorService {
  private doctors: Doctor[]

  constructor() {
    // Simulated database
    this.doctors = [
      {
        id: '1',
        name: 'Dr. Smith',
        specialty: 'Cardiology',
      },
      {
        id: '2',
        name: 'Dr. Johnson',
        specialty: 'Pediatrics',
      },
      // Add more doctors...
    ]
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return this.doctors
  }
}
