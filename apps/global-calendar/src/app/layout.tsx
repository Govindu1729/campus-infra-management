import type { Metadata } from 'next'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Digital Infra IITGN',
  description: 'Campus Infrastructure Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-500">
              <span>© 2026 Indian Institute of Technology Gandhinagar</span>
              <span>Campus Infrastructure Management Platform</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
