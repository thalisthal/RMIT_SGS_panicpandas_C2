export const RECORD_KEY = 'carepass:medical_record'
export const DOCTOR_B_APPROVAL_KEY = 'carepass:medical_record:doctor-b-approved'
export const MEDICAL_RECORD_TAG = 'medical_record'

export const DEMO_PERSONAS = {
  'doctor-a': {
    label: 'Doctor A',
    role: '_tide_medical_record.selfencrypt',
    route: '/doctor-a',
  },
  patient: {
    label: 'Patient',
    role: 'carepass_patient',
    route: '/patient',
  },
  'doctor-b': {
    label: 'Doctor B',
    role: '_tide_medical_record.selfdecrypt',
    route: '/doctor-b',
  },
  admin: {
    label: 'Admin',
    role: 'carepass_admin',
    route: '/admin',
  },
} as const

export type DemoPersona = keyof typeof DEMO_PERSONAS
export type DemoUser = {
  id: string
  persona: DemoPersona
  name: string
  roles: string[]
}
