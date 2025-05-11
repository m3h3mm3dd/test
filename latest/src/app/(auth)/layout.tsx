"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isRegister = pathname.includes("register")
  const direction = isRegister ? 1 : -1

  return (
    <main className="min-h-screen w-full flex overflow-hidden bg-gradient-to-br from-[#1c1b3a] via-[#202144] to-[#171738] text-white font-sans relative">

      {/* Backdrop Glows */}
      <div className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500 opacity-20 rounded-full blur-[200px] z-0" />
      <div className="absolute bottom-[-20vh] right-[-10vw] w-[60vw] h-[60vw] bg-purple-500 opacity-10 rounded-full blur-[180px] z-0" />

      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 items-center justify-center px-20 relative z-10">
        <motion.div
          key={isRegister ? "registerText" : "loginText"}
          initial={{ opacity: 0, x: -direction * 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * 80 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="max-w-md space-y-6"
        >
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            {isRegister ? "Create your TaskUp account." : "Welcome back to TaskUp."}
          </h1>
          <p className="text-zinc-300 text-base leading-relaxed">
            {isRegister
              ? "Let’s get you started. It only takes a few seconds to create your account."
              : "Log in to continue managing your team with clarity and speed."}
          </p>
        </motion.div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 60 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl px-8 py-10 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
