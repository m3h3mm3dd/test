"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const messages = [
  "Precision in every detail.",
  "Design meets performance.",
  "Your flow, uninterrupted.",
  "Productivity, redefined.",
  "Welcome to your command center.",
]

export default function Onboarding() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem("taskup_onboarded")
    const userId = localStorage.getItem("userId")
    if (onboarded === "true" && userId) {
      router.push("/dashboard")
    } else if (onboarded === "true") {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setLeaving(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length)
        setLeaving(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const go = (path: string) => {
    try {
      localStorage.setItem("taskup_onboarded", "true")
    } catch {}
    router.push(path)
  }

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden text-white font-sans">
      {/* 🫧 Glowing Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500 opacity-20 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-20vh] right-[-10vw] w-[60vw] h-[60vw] bg-purple-500 opacity-10 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-extrabold tracking-wide text-indigo-400 mb-1"
        >
          TaskUp
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-md text-zinc-300 mb-8"
        >
          Focused work. Beautifully managed.
        </motion.p>

        <div className="relative mb-8 text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.25] pb-[2px]">
          <AnimatePresence mode="wait">
            {!leaving && (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="inline-block bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent"
              >
                {messages[index]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-10 w-[90%] max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg"
        >
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-sm text-indigo-300 font-semibold mb-1">Project • UX Launch</p>
              <p className="text-lg font-medium text-white">Redefine Authentication</p>
              <p className="text-xs text-zinc-400 mt-1">Due: May 22 • Priority: Critical</p>
            </div>
            <div className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              In Progress
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => go("/register")}
            className="bg-white text-black font-semibold px-6 py-3 rounded-full shadow-xl hover:ring-2 hover:ring-white/30 transition-all backdrop-blur-md"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => go("/login")}
            className="border border-white/30 text-white px-6 py-3 rounded-full hover:bg-white/10 backdrop-blur-md transition-all"
          >
            Log In
          </motion.button>
        </motion.div>
      </div>

      <footer className="relative z-10 text-sm text-white/40 px-6 py-6 flex justify-between items-center border-t border-white/10 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} TaskUp. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Changelog</a>
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Contact</a>
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Docs</a>
        </div>
      </footer>
    </main>
  )
}
