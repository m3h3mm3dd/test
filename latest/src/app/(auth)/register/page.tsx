"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { motion } from "framer-motion"

export default function RegisterStepOne() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async () => {
    if (!isEmail(email)) {
      setError("Enter a valid email.")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/otp", { Email: email })
      localStorage.setItem("taskup_register_email", email)
      toast.success("Verification code sent to your email.")
      router.push("/verify")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send code.")
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
      <h2 className="text-xl font-bold text-white">Create your account</h2>

      <FormInput
        id="register-email"
        label="Email"
        error={error}
        inputProps={{
          id: "register-email",
          name: "Email",
          type: "email",
          placeholder: "you@example.com",
          value: email,
          onChange: (e) => {
            setError("")
            setEmail(e.target.value)
          },
        }}
      />

      <motion.div whileTap={{ scale: 0.96 }}>
        <Button className="w-full mt-2" isLoading={loading} onClick={handleSubmit}>
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}
