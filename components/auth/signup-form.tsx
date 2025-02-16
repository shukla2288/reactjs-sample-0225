"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import Link from "next/link"
import { useToast } from "../ui/use-toast"
import React from "react"

export function SignUpForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Here you would implement Firebase signup
      // For now, we'll just simulate a successful signup
      if (username && email && password && acceptTerms) {
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Sign up</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I accept the terms & conditions
          </label>
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}

