import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import CarePassNavigation from './components/carepass-navigation'
import { DemoAuthProvider } from './lib/demo-auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'CarePass',
  description: 'Secure healthcare access with CarePass.',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <DemoAuthProvider>
          <CarePassNavigation />
          {children}
        </DemoAuthProvider>
      </body>
    </html>
  )
}
