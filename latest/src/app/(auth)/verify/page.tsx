"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { api } from "@/lib/api"
import { motion } from "framer-motion"

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const e = localStorage.getItem("taskup_register_email")
    if (!e) router.push("/register")
    else setEmail(e)
  }, [])

  const handleSubmit = async () => {
    if (!code || code.length < 6) {
      toast.error("Enter the 6-digit code.")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/verify", { Code: code })
      toast.success("Email verified ✅")
      router.push("/finishRegister")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid or expired code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-white">Verify your email</h2>

      <p className="text-sm text-zinc-400">
        We’ve sent a 6-digit verification code to <strong>{email}</strong>.
      </p>

      <FormInput
        id="verify-code"
        label="Verification Code"
        inputProps={{
          id: "verify-code",
          name: "Code",
          placeholder: "123456",
          maxLength: 6,
          value: code,
          onChange: (e) => setCode(e.target.value),
        }}
      />

      <Button className="w-full" isLoading={loading} onClick={handleSubmit}>
        Continue
      </Button>
    </motion.div>
  )
}
