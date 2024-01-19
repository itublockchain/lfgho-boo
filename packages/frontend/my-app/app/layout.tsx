import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConnectkitProvider } from './connectkit-provider'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boo!',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}> 
      <div>
      
        <ConnectkitProvider>
          {children}
        </ConnectkitProvider>
        </div>
      </body>
    </html>
  )
}
