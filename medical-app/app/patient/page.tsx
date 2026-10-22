'use client'

import { useEffect, useState } from 'react'
import {
  DEMO_PERSONAS,
  DOCTOR_B_APPROVAL_KEY,
  RECORD_KEY,
} from '../lib/demo-auth-shared'
import {
  RoleGate,
  useCarePassAuth,
} from '../lib/demo-auth'

export default function PatientPage() {
  const {
    authorizeDoctorB: recordDoctorBConsent,
    revokeDoctorBConsent: clearDoctorBConsent,
  } = useCarePassAuth()
  const [encryptedRecord, setEncryptedRecord] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [doctorBApproved, setDoctorBApproved] = useState(false)

  useEffect(() => {
    setEncryptedRecord(localStorage.getItem(RECORD_KEY))
    setDoctorBApproved(localStorage.getItem(DOCTOR_B_APPROVAL_KEY) === 'true')
  }, [])

  const setDoctorBConsent = () => {
    try {
      if (doctorBApproved) {
        clearDoctorBConsent()
        setDoctorBApproved(false)
        setMessage('Demo consent revoked: Doctor B may no longer request access.')
      } else {
        recordDoctorBConsent()
        setDoctorBApproved(true)
        setMessage('Demo consent recorded: Doctor B may request access.')
      }
    } catch (error) {
      console.error('Could not update demo consent:', error)
      setMessage(
        error instanceof Error ? error.message : 'Could not update consent.',
      )
    }
  }

  return (
    <RoleGate requiredRole={DEMO_PERSONAS.patient.role}>
      <main className="app-main">
        <section className="surface-card mx-auto max-w-3xl p-6 sm:p-9">
          <p className="section-eyebrow">
            CarePass · Patient
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your medical record
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review the protected record and manage Doctor B’s demo access.
          </p>
          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span aria-hidden="true" className="size-2 rounded-full bg-teal-600" />
              Encrypted record
            </h2>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-700">
            {encryptedRecord ?? 'No encrypted record has been saved yet.'}
          </pre>
          </div>
          <button
            type="button"
            onClick={setDoctorBConsent}
            className={`mt-5 inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 font-semibold text-white transition ${
              doctorBApproved
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-teal-700 shadow-sm shadow-teal-900/15 hover:bg-teal-800'
            }`}
          >
            {doctorBApproved
              ? 'Revoke Doctor B Access'
              : 'Authorize Doctor B'}
          </button>
          {message && (
            <p role="status" className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
              {message}
            </p>
          )}
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Demo consent is stored in this browser and is not a real Tide
            relationship policy.
          </p>
        </section>
      </main>
    </RoleGate>
  )
}
