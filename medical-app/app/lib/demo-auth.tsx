'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import {
  DEMO_PERSONAS,
  DOCTOR_B_APPROVAL_KEY,
  MEDICAL_RECORD_TAG,
  RECORD_KEY,
  type DemoPersona,
  type DemoUser,
} from './demo-auth-shared'

type DemoAuthValue = {
  ready: boolean
  user: DemoUser | null
  isDemo: true
  signIn: (persona: DemoPersona) => void
  signOut: () => void
  hasRole: (role: string) => boolean
  encryptRecord: (plaintext: string) => Promise<string>
  decryptRecord: (ciphertext: string) => Promise<string>
  authorizeDoctorB: () => void
  revokeDoctorBConsent: () => void
}

const USER_STORAGE_KEY = 'carepass:demo-user'
const ENCRYPTION_KEY_STORAGE_KEY = 'carepass:demo-encryption-key'
const AuthContext = createContext<DemoAuthValue | null>(null)

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function getDemoEncryptionKey(): Promise<CryptoKey> {
  let rawKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY)
  if (!rawKey) {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32))
    rawKey = toBase64(keyBytes)
    localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, rawKey)
  }

  return crypto.subtle.importKey(
    'raw',
    fromBase64(rawKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as DemoUser)
      } catch (error) {
        console.error('Could not restore the demo user session:', error)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
    setReady(true)
  }, [])

  const signIn = useCallback((persona: DemoPersona) => {
    const definition = DEMO_PERSONAS[persona]
    const nextUser: DemoUser = {
      id: `demo-${persona}`,
      persona,
      name: definition.label,
      roles: [definition.role],
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: string) => user?.roles.includes(role) ?? false,
    [user],
  )

  const encryptRecord = useCallback(
    async (plaintext: string) => {
      if (!hasRole('_tide_medical_record.selfencrypt')) {
        throw new Error('Access denied: medical-record encryption role required.')
      }

      const key = await getDemoEncryptionKey()
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
          additionalData: new TextEncoder().encode(MEDICAL_RECORD_TAG),
        },
        key,
        new TextEncoder().encode(plaintext),
      )

      return JSON.stringify({
        mode: 'carepass-demo-only',
        algorithm: 'AES-GCM',
        tag: MEDICAL_RECORD_TAG,
        iv: toBase64(iv),
        ciphertext: toBase64(new Uint8Array(ciphertext)),
      })
    },
    [hasRole],
  )

  const decryptRecord = useCallback(
    async (encryptedBlob: string) => {
      if (!hasRole('_tide_medical_record.selfdecrypt')) {
        throw new Error(
          'ACCESS DENIED: Admin lacks the required selfdecrypt role.',
        )
      }
      if (localStorage.getItem(DOCTOR_B_APPROVAL_KEY) !== 'true') {
        throw new Error('Access denied: patient authorization is required.')
      }

      const blob: unknown = JSON.parse(encryptedBlob)
      if (
        typeof blob !== 'object' ||
        blob === null ||
        !('mode' in blob) ||
        blob.mode !== 'carepass-demo-only' ||
        !('algorithm' in blob) ||
        blob.algorithm !== 'AES-GCM' ||
        !('tag' in blob) ||
        blob.tag !== MEDICAL_RECORD_TAG ||
        !('iv' in blob) ||
        typeof blob.iv !== 'string' ||
        !('ciphertext' in blob) ||
        typeof blob.ciphertext !== 'string'
      ) {
        throw new Error('The saved value is not a valid CarePass demo record.')
      }

      const key = await getDemoEncryptionKey()
      const plaintext = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: fromBase64(blob.iv),
          additionalData: new TextEncoder().encode(MEDICAL_RECORD_TAG),
        },
        key,
        fromBase64(blob.ciphertext),
      )
      return new TextDecoder().decode(plaintext)
    },
    [hasRole],
  )

  const authorizeDoctorB = useCallback(() => {
    if (user?.persona !== 'patient') {
      throw new Error('Only the patient demo account can authorize Doctor B.')
    }
    localStorage.setItem(DOCTOR_B_APPROVAL_KEY, 'true')
    console.info('Demo consent granted: Doctor B may request this record.')
  }, [user])

  const revokeDoctorBConsent = useCallback(() => {
    if (user?.persona !== 'patient') {
      throw new Error('Only the patient demo account can revoke Doctor B access.')
    }
    localStorage.removeItem(DOCTOR_B_APPROVAL_KEY)
    console.info('Demo consent revoked: Doctor B may no longer request this record.')
  }, [user])

  const value = useMemo(
    () => ({
      ready,
      user,
      isDemo: true as const,
      signIn,
      signOut,
      hasRole,
      encryptRecord,
      decryptRecord,
      authorizeDoctorB,
      revokeDoctorBConsent,
    }),
    [
      ready,
      user,
      signIn,
      signOut,
      hasRole,
      encryptRecord,
      decryptRecord,
      authorizeDoctorB,
      revokeDoctorBConsent,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useCarePassAuth(): DemoAuthValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useCarePassAuth must be used inside DemoAuthProvider.')
  }
  return value
}

export function RoleGate({
  requiredRole,
  children,
}: {
  requiredRole: string
  children: ReactNode
}) {
  const { ready, user, hasRole } = useCarePassAuth()

  if (!ready) {
    return <p className="p-8 text-center text-slate-600">Loading demo session…</p>
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in required</h1>
          <p className="mt-2 text-slate-600">
            Choose a demo identity to continue.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            Go to demo sign-in
          </Link>
        </section>
      </main>
    )
  }

  if (!hasRole(requiredRole)) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-800">Access denied</h1>
          <p className="mt-2 text-slate-700">
            {user.name} does not have the required demo role.
          </p>
        </section>
      </main>
    )
  }

  return children
}
