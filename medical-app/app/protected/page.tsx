'use client'

import { DEMO_PERSONAS } from '../lib/demo-auth-shared'
import { RoleGate } from '../lib/demo-auth'

export default function ProtectedPage() {
  return (
    <RoleGate requiredRole={DEMO_PERSONAS.admin.role}>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Demo-protected page
          </h1>
          <p className="mt-2 text-slate-600">
            The simulated admin role can view this page. This check is
            client-side only and is not server security.
          </p>
        </section>
      </main>
    </RoleGate>
  )
}
