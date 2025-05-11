"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/FormInput"
import { toast } from "@/lib/toast"
import { api } from "@/lib/api"

export default function DevRegisterPage() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post("/register", form)
      toast.success("User created. Try logging in.")
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Register failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4 mt-10 px-4">
      <h2 className="text-xl font-bold text-white">Dev Register</h2>
      <FormInput label="First Name" inputProps={{ name: "FirstName", value: form.FirstName, onChange: handleChange }} />
      <FormInput label="Last Name" inputProps={{ name: "LastName", value: form.LastName, onChange: handleChange }} />
      <FormInput label="Email" inputProps={{ name: "Email", type: "email", value: form.Email, onChange: handleChange }} />
      <FormInput label="Password" inputProps={{ name: "Password", type: "password", value: form.Password, onChange: handleChange }} />
      <Button isLoading={loading} onClick={handleSubmit} className="w-full">Register</Button>
    </div>
  )
}
