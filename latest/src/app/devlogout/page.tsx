"use client"

import { useEffect } from "react"

export default function DevLogoutPage() {
  useEffect(() => {
    localStorage.removeItem("userId")
    window.location.href = "/login"
  }, [])

  return (
    <main className="text-white text-center py-20">
      <h1 className="text-xl">Logging out...</h1>
    </main>
  )
}
