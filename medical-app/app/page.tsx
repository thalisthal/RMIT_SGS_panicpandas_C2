'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_PERSONAS, type DemoPersona } from './lib/demo-auth-shared'
import { useCarePassAuth } from './lib/demo-auth'

const personaDescriptions: Record<DemoPersona, string> = {
  'doctor-a': 'Create and encrypt a patient medical record.',
  patient: 'Review the encrypted record and manage consent.',
  'doctor-b': 'Read a record after patient authorization.',
  admin: 'View protected data and verify access controls.',
}

export default function LoginPage() {
  const { ready, user, signIn } = useCarePassAuth()
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] =
    useState<DemoPersona>('doctor-a')

  const handleSignIn = () => {
    signIn(selectedPersona)
    router.push(DEMO_PERSONAS[selectedPersona].route)
  }

  return (
    <main className="app-main flex items-center">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_-48px_rgba(15,56,55,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 p-7 text-white sm:p-10 lg:min-h-[34rem]">
          <div aria-hidden="true" className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-5 -top-9 size-44 rounded-full border border-white/10" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">
              CarePass · Local demo
            </p>
            <h1 className="mt-7 max-w-md text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Care, connected with confidence.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-teal-50/90 sm:text-base">
              A simple demonstration of encrypted medical records and patient-directed access.
            </p>
          </div>
          <div className="relative mt-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold">Privacy-first by design</p>
            <p className="mt-1 text-xs leading-5 text-teal-50/80">
              Choose a demo role to explore how access changes across the care team.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <p className="section-eyebrow">Welcome to CarePass</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Choose a demo identity
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select a role to explore its part in the patient record workflow.
          </p>

          {!ready ? (
            <p role="status" className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Restoring demo session…
            </p>
          ) : (
            <>
              {user && (
                <p className="mt-5 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
                  Signed in as <strong>{user.name}</strong>. Select a role below to switch demo identities.
                </p>
              )}
              <fieldset className="mt-7 grid gap-3 sm:grid-cols-2">
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  Demo roles
                </legend>
                {(Object.keys(DEMO_PERSONAS) as DemoPersona[]).map((persona) => (
                  <label
                    key={persona}
                    className={`group cursor-pointer rounded-xl border p-4 transition ${
                      selectedPersona === persona
                        ? 'border-teal-700 bg-teal-50/80 ring-2 ring-teal-700/15'
                        : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="demo-persona"
                      value={persona}
                      checked={selectedPersona === persona}
                      onChange={() => setSelectedPersona(persona)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${
                        selectedPersona === persona ? 'bg-teal-600' : 'bg-slate-300 group-hover:bg-teal-400'
                      }`} />
                      <span className="font-semibold text-slate-900">
                        {DEMO_PERSONAS[persona].label}
                      </span>
                    </span>
                    <span className="mt-2 block pl-4 text-xs leading-5 text-slate-600">
                      {personaDescriptions[persona]}
                    </span>
                  </label>
                ))}
              </fieldset>
              <button
                type="button"
                onClick={handleSignIn}
                className="primary-button mt-6 w-full"
              >
                Continue as {DEMO_PERSONAS[selectedPersona].label}
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Sign-in, role checks, consent, and encryption are simulated locally for demonstration.
          </p>
        </section>
      </div>
    </main>
  )
}
