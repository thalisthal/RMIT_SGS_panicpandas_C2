'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCarePassAuth } from '../lib/demo-auth'
import { DEMO_PERSONAS } from '../lib/demo-auth-shared'

export default function CarePassNavigation() {
  const { user, signOut } = useCarePassAuth()
  const router = useRouter()
  const profile = user ? DEMO_PERSONAS[user.persona] : null
  const initials = user?.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  return (
    <>
      <nav
        aria-label="Demo navigation"
        className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <Link
            href="/"
            aria-label="CarePass home"
            className="mr-2 inline-flex items-center gap-2.5"
          >
            <span
              aria-hidden="true"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-teal-950 shadow-sm shadow-teal-900/20"
            >
              <span className="absolute h-4 w-1.5 rounded-full bg-white" />
              <span className="absolute h-1.5 w-4 rounded-full bg-white" />
            </span>
            <span className="text-2xl font-black leading-none tracking-tight sm:text-[1.7rem]">
              <span className="text-teal-800">Care</span>
              <span className="text-slate-900">Pass</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user && profile ? (
              <>
                <Link
                  href={profile.route}
                  aria-label={`${user.name} profile`}
                  className="flex min-w-0 items-center gap-2 rounded-full p-1.5 pr-3 transition hover:bg-slate-50"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-sm font-bold text-teal-900 ring-1 ring-teal-200"
                  >
                    {initials}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>
                    <span className="hidden text-xs text-slate-500 sm:block">
                      {profile.label} profile
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>
      <p
        role="note"
        className="border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 sm:text-sm"
      >
        DEMO MODE — sign-in, roles, consent, and encryption are simulated locally.
        Do not enter real patient information.
      </p>
    </>
  )
}
