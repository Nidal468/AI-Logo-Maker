// app/(auth)/edit-asset/page.tsx
import React, { Suspense } from 'react'
import dynamicImport from 'next/dynamic'      // ← renamed import

// Opt out of static rendering
export const dynamic = 'force-dynamic'

// Dynamically load your client‐only editor (no SSR)
const EditAssetEditor = dynamicImport(
  () => import('./EditAssetEditor'),
  { ssr: false }
)

export default function EditAssetPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading editor…</div>}>
        <EditAssetEditor />
      </Suspense>
    </div>
  )
}
