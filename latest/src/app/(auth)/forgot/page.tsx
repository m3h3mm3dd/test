"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { api } from "@/lib/axios"
import { Mail, ArrowRight } from "lucide-react"

export default function ForgotPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async () => {
    if (!email) return toast.error("Please enter your email address.")
    setLoading(true)
    try {
      await api.post("/email/send-verification-code", null, {
        params: { recipientEmail: email }
      })
      localStorage.setItem("taskup_reset_email", email)
      toast.success("Reset code sent to your email.")
      router.push("/reset")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reset code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-6">
      {/* Ambient background elements */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500 opacity-20 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20vh] right-[-10vw] w-[60vw] h-[60vw] bg-purple-500 opacity-10 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl relative z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-2"
          >
            <Mail className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white"
          >
            Forgot Password
          </motion.h1>
          
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 max-w-sm mx-auto"
          >
            Enter your email address and we'll send you a password reset code.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <FormInput
            label="Email Address"
            icon={<Mail className="h-4 w-4" />}
            inputProps={{
              name: "email",
              type: "email",
              placeholder: "you@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              autoFocus: true,
              className: "bg-white/10 border-white/10 focus:border-indigo-500/50",
            }}
          />

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-2"
          >
            <Button 
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 relative overflow-hidden group"
              onClick={handleSubmit}
              isLoading={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {!loading && (
                  <>
                    Send Reset Code
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                style={{ zIndex: 1 }}
              />
            </Button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-zinc-400 mt-4"
          >
            Remembered your password?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-indigo-400 hover:text-indigo-300 transition font-medium hover:underline underline-offset-2"
            >
              Back to login
            </button>
          </motion.p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full blur-2xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full blur-2xl -z-10 transform -translate-x-1/2 translate-y-1/2" />
      </motion.div>
    </div>
  )
}