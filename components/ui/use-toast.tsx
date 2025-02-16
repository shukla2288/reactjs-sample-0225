'use client'
import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void
}>({
  toast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = (props: ToastProps) => {
    console.log("Toast:", props) // Placeholder for actual toast implementation
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
} 