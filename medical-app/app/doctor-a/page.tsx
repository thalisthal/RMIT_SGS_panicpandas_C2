'use client'

import { useState } from 'react'
import {
  MEDICAL_RECORD_TAG,
  RECORD_KEY,
} from '../lib/demo-auth-shared'
import {
  RoleGate,
  useCarePassAuth,
} from '../lib/demo-auth'

export default function DoctorAPage() {
  const { encryptRecord } = useCarePassAuth()
  const [patientName, setPatientName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [patientId, setPatientId] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [record, setRecord] = useState('Blood Type: O+, Allergy: Penicillin')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const encryptAndSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const plaintext = [
        'Patient Information',
        `Name: ${patientName.trim()}`,
        `Date of birth: ${dateOfBirth || 'Not provided'}`,
        `Patient ID: ${patientId.trim() || 'Not provided'}`,
        `Contact number: ${contactNumber.trim() || 'Not provided'}`,
        '',
        'Medical Record',
        record.trim(),
      ].join('\n')
      const encrypted = await encryptRecord(plaintext)

      if (typeof encrypted !== 'string' || encrypted.length === 0) {
        throw new Error('Demo encryption did not return a medical record.')
      }

      localStorage.setItem(RECORD_KEY, encrypted)
      setMessage(
        `Record encrypted with the simulated ${MEDICAL_RECORD_TAG} tag and saved.`,
      )
    } catch (error) {
      console.error('Could not encrypt and save the medical record:', error)
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not encrypt and save the medical record.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <RoleGate requiredRole="_tide_medical_record.selfencrypt">
      <main className="app-main">
        <section className="surface-card mx-auto max-w-3xl p-6 sm:p-9">
          <p className="section-eyebrow">
            CarePass · Doctor A
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Create a medical record
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Add the patient details and clinical notes. The complete record is encrypted before it is saved.
          </p>
          <form onSubmit={encryptAndSave}>
            <fieldset className="mt-8 border-t border-slate-100 pt-6">
              <legend className="text-base font-bold text-slate-900">
                Patient information
              </legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Full name
                  <input
                    type="text"
                    autoComplete="name"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    required
                    className="form-control mt-1.5 px-3.5 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Date of birth
                  <input
                    type="date"
                    autoComplete="bday"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    className="form-control mt-1.5 px-3.5 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Patient ID
                  <input
                    type="text"
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                    className="form-control mt-1.5 px-3.5 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Contact number
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={contactNumber}
                    onChange={(event) => setContactNumber(event.target.value)}
                    className="form-control mt-1.5 px-3.5 py-3"
                  />
                </label>
              </div>
            </fieldset>
            <label
              htmlFor="medical-record"
              className="mt-7 block border-t border-slate-100 pt-6 text-base font-bold text-slate-900"
            >
              Medical record
            </label>
            <textarea
              id="medical-record"
              value={record}
              onChange={(event) => setRecord(event.target.value)}
              rows={6}
              required
              className="form-control mt-2 px-3.5 py-3"
            />
            <button
              type="submit"
              disabled={busy || !record.trim() || !patientName.trim()}
              className="primary-button mt-5"
            >
              {busy ? 'Encrypting…' : 'Encrypt & Save'}
            </button>
          </form>
          {message && (
            <p role="status" className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
              {message}
            </p>
          )}
        </section>
      </main>
    </RoleGate>
  )
}
