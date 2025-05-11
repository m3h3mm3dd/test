"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/FormInput"
import { api } from "@/lib/api"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [form, setForm] = useState({ code: "", newPassword: "" })
  const [errors, setErrors] = useState<{ code?: string; newPassword?: string }>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskup_reset_email")
    if (!stored) {
      router.push("/forgot")
    } else {
      setEmail(stored)
    }
  }, [])

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.code) errs.code = "Code is required."
    if (!form.newPassword) errs.newPassword = "New password is required."
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await api.post("/reset-password", {
        email,
        code: form.code,
        newPassword: form.newPassword,
      })
      toast.success("Password reset successfully")
      localStorage.removeItem("taskup_reset_email")
      router.push("/login")
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-white">Reset your password</h1>
        <p className="text-sm text-zinc-400">Enter the reset code and your new password.</p>
      </div>

      <FormInput
        label="Reset Code"
        error={errors.code}
        inputProps={{
          name: "code",
          placeholder: "123456",
          value: form.code,
          onChange: (e) => handleChange("code", e.target.value),
        }}
      />

      <FormInput
        label="New Password"
        error={errors.newPassword}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="hover:text-white transition"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        inputProps={{
          name: "newPassword",
          type: showPassword ? "text" : "password",
          placeholder: "••••••••",
          value: form.newPassword,
          onChange: (e) => handleChange("newPassword", e.target.value),
        }}
      />

      <Button className="w-full mt-2" isLoading={loading} onClick={handleSubmit}>
        Reset Password
      </Button>

      <p className="text-sm text-center text-zinc-400 mt-4">
        Remembered it?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-indigo-300 hover:underline font-medium transition"
        >
          Back to login
        </button>
      </p>
    </motion.div>
  )
}
