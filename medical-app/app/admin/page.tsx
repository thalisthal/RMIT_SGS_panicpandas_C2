'use client'

import { useEffect, useState } from 'react'
import { DEMO_PERSONAS, RECORD_KEY } from '../lib/demo-auth-shared'
import {
  RoleGate,
  useCarePassAuth,
} from '../lib/demo-auth'

export default function AdminPage() {
  const { decryptRecord } = useCarePassAuth()
  const [encryptedRecord, setEncryptedRecord] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setEncryptedRecord(localStorage.getItem(RECORD_KEY))
  }, [])

  const attemptDecrypt = async () => {
    setError('')

    if (!encryptedRecord) {
      setError('No encrypted medical record has been saved yet.')
      return
    }

    setBusy(true)
    try {
      await decryptRecord(encryptedRecord)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Admin medical-record decryption was denied.'
      console.info('Admin medical-record decryption denied:', message)
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <RoleGate requiredRole={DEMO_PERSONAS.admin.role}>
      <main className="app-main">
        <section className="surface-card mx-auto max-w-3xl p-6 sm:p-9">
          <p className="section-eyebrow text-slate-600">
            CarePass · Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Encrypted medical record
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Administrative access does not include permission to decrypt patient data.
          </p>
          <pre className="mt-7 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
            {encryptedRecord ?? 'No encrypted record has been saved yet.'}
          </pre>
          <button
            type="button"
            onClick={attemptDecrypt}
            disabled={busy || !encryptedRecord}
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-red-700 px-5 py-3 font-semibold text-white shadow-sm shadow-red-900/15 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Attempting…' : 'Admin Override: Attempt Decrypt'}
          </button>
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}
        </section>
      </main>
    </RoleGate>
  )
}
