'use client'

import { LTRFLSidebar } from '@/components/ltrfl/LTRFLSidebar'

export default function LTRFLLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <LTRFLSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
