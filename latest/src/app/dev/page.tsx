"use client"

import { useEffect } from "react"

export default function DevBypassLogin() {
  useEffect(() => {
    localStorage.setItem("userId", "dev-user-id")
    window.location.href = "/dashboard"
  }, [])

  return (
    <main className="text-white text-center py-20">
      <h1 className="text-2xl">Redirecting to dashboard...</h1>
    </main>
  )
}
