// app/(auth)/edit-asset/page.tsx
import React, { Suspense } from 'react'
import dynamicImport from 'next/dynamic'      // ← renamed import

// Opt out of static rendering
export const dynamic = 'force-dynamic'

// Dynamically load your client‐only editor (no SSR)
const OrdersManagementPage = dynamicImport(
  () => import('./OrdersManagementPage'),
  { ssr: false }
)

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading editor…</div>}>
        <OrdersManagementPage />
      </Suspense>
    </div>
  )
}
