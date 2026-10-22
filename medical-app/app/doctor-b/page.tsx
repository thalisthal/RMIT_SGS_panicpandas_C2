'use client'

import { useState } from 'react'
import { DEMO_PERSONAS, RECORD_KEY } from '../lib/demo-auth-shared'
import {
  RoleGate,
  useCarePassAuth,
} from '../lib/demo-auth'

export default function DoctorBPage() {
  const { decryptRecord } = useCarePassAuth()
  const [record, setRecord] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const decryptAndRead = async () => {
    setRecord(null)
    setMessage('')

    const encrypted = localStorage.getItem(RECORD_KEY)
    if (!encrypted) {
      setMessage('No encrypted medical record has been saved yet.')
      return
    }

    setBusy(true)
    try {
      setRecord(await decryptRecord(encrypted))
    } catch (error) {
      console.info(
        'Doctor B could not read the medical record:',
        error instanceof Error ? error.message : error,
      )
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not decrypt the medical record.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <RoleGate requiredRole="_tide_medical_record.selfdecrypt">
      <main className="app-main">
        <section className="surface-card mx-auto max-w-3xl p-6 sm:p-9">
          <p className="section-eyebrow">
            CarePass · Doctor B
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Read an authorized record
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Decrypt the patient record only after the patient has granted demo consent.
          </p>
          <button
            type="button"
            onClick={decryptAndRead}
            disabled={busy}
            className="primary-button mt-6"
          >
            {busy ? 'Decrypting…' : 'Decrypt & Read'}
          </button>
          {message && (
            <p role="status" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {message}
            </p>
          )}
          {record !== null && (
            <div className="mt-6">
              <h2 className="border-t border-slate-100 pt-6 text-sm font-bold text-slate-800">
                Medical record
              </h2>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-800">
                {record}
              </pre>
            </div>
          )}
        </section>
      </main>
    </RoleGate>
  )
}
