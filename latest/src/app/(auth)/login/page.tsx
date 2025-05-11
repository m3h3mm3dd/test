"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ Email: "", Password: "" })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.Email || !form.Password) {
      toast.error("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/login", form)

      // ✅ Store user ID for session role-checks
      localStorage.setItem("userId", res.data.Id)

      toast.success("Welcome back 👋")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Log In</h2>

      <div className="space-y-4">
        <FormInput
          id="login-email"
          label="Email"
          inputProps={{
            id: "login-email",
            name: "Email",
            type: "email",
            placeholder: "you@example.com",
            value: form.Email,
            onChange: handleChange,
          }}
        />
        <FormInput
          id="login-password"
          label="Password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="hover:text-white transition"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          inputProps={{
            id: "login-password",
            name: "Password",
            type: show ? "text" : "password",
            placeholder: "••••••••",
            value: form.Password,
            onChange: handleChange,
          }}
        />
      </div>

      <div className="flex justify-between mt-3 mb-5 text-sm">
        <button
          onClick={() => router.push("/forgot")}
          className="text-indigo-400 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <Button onClick={handleSubmit} isLoading={loading} className="w-full">
        Log In
      </Button>

      <p className="text-sm text-center text-zinc-400 mt-6">
        Don’t have an account?{" "}
        <button
          onClick={() => router.push("/register")}
          className="text-indigo-400 hover:underline"
        >
          Register
        </button>
      </p>
    </>
  )
}
