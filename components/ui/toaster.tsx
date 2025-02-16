'use client'
import { Toast, ToastProvider } from "./toast"
import { useToast } from "./use-toast"
import React from "react"
export function Toaster() {
  const { toast } = useToast()

  return (
    <ToastProvider>
      <Toast />
    </ToastProvider>
  )
} 