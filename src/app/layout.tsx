import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/toaster'
import Providers from '@/providers/providers'
import { ThemeProvider } from '@/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buy-It Super store Admin',
  description: 'Admin panel to manage you store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ModalProvider />
              {children}
              <Toaster />
            </ThemeProvider>
            
          </body>
        </html>
      </Providers>
    </ClerkProvider>
    
  )
}
