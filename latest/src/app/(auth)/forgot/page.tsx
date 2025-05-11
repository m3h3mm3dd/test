"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { api } from "@/lib/api"

export default function ForgotPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) return toast.error("Please enter your email.")
    setLoading(true)
    try {
      await api.post("/auth/forgot", { Email: email })
      toast.success("Reset code sent to your email.")
      router.push("/reset")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Forgot Password</h2>

      <p className="text-sm text-zinc-400 mb-4">
        Enter your email address and we’ll send you a password reset code.
      </p>

      <FormInput
        label="Email"
        inputProps={{
          name: "Email",
          type: "email",
          placeholder: "you@example.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
        }}
      />

      <Button
        isLoading={loading}
        className="w-full mt-6"
        onClick={handleSubmit}
      >
        Send Reset Code
      </Button>
    </>
  )
}
