"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { api } from "@/lib/api"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function FinishRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [form, setForm] = useState({ FirstName: "", LastName: "", Password: "", RepeatPassword: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const e = localStorage.getItem("taskup_register_email")
    if (!e) router.push("/register")
    else setEmail(e)
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!form.FirstName) e.FirstName = "Required"
    if (!form.LastName) e.LastName = "Required"
    if (!form.Password || form.Password.length < 6) e.Password = "Min 6 characters"
    if (form.Password !== form.RepeatPassword) e.RepeatPassword = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await api.post("/auth/register", {
        ...form,
        Email: email,
      })
      toast.success("Account created!")
      localStorage.removeItem("taskup_register_email")
      router.push("/login")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register.")
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
      <h2 className="text-xl font-bold text-white">Finish creating your account</h2>

      <FormInput
        id="first-name"
        label="First Name"
        error={errors.FirstName}
        inputProps={{
          id: "first-name",
          name: "FirstName",
          placeholder: "Jane",
          value: form.FirstName,
          onChange: handleChange,
        }}
      />
      <FormInput
        id="last-name"
        label="Last Name"
        error={errors.LastName}
        inputProps={{
          id: "last-name",
          name: "LastName",
          placeholder: "Doe",
          value: form.LastName,
          onChange: handleChange,
        }}
      />
      <FormInput
        id="password"
        label="Password"
        error={errors.Password}
        rightSlot={
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShow((s) => !s)}
            className="hover:text-white transition"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>
        }
        inputProps={{
          id: "password",
          name: "Password",
          type: show ? "text" : "password",
          placeholder: "••••••••",
          value: form.Password,
          onChange: handleChange,
        }}
      />
      <FormInput
        id="repeat-password"
        label="Repeat Password"
        error={errors.RepeatPassword}
        inputProps={{
          id: "repeat-password",
          name: "RepeatPassword",
          type: show ? "text" : "password",
          placeholder: "••••••••",
          value: form.RepeatPassword,
          onChange: handleChange,
        }}
      />

      <Button className="w-full mt-2" isLoading={loading} onClick={handleSubmit}>
        Finish Registration
      </Button>
    </motion.div>
  )
}
