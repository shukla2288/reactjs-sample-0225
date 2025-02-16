import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "../components/ui/toaster"
import React from "react"
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TasksBoard",
  description: "A modern task management application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

