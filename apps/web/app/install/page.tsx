'use client'

import { Navigation } from "../../components/navigation"

export default function InstallPage() {
  return (
    <div>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <h1>Install Page</h1>
          <p>This is a test page.</p>
        </div>
      </main>
    </div>
  )
}