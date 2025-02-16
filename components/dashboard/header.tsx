"use client"
import { Brain } from "lucide-react"
import { Avatar } from "../ui/avatar"
import { ConnectWalletButton } from "../web3/connect-wallet" 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState, useEffect } from "react"
import React from "react"

export function DashboardHeader() {
  const [profileImage, setProfileImage] = useState("")

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const randomId = Math.floor(Math.random() * 1000)
        const response = await fetch(`https://picsum.photos/id/${randomId}/info`)
        const data = await response.json()
        setProfileImage(data.download_url)
      } catch (error) {
        console.error("Error fetching profile image:", error)
        setProfileImage("/placeholder.svg")
      }
    }

    fetchProfileImage()
  }, [])

  return (
    <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Brain size={32} />
        <h1 className="text-xl font-semibold">TasksBoard</h1>
      </div>
      
      <Avatar className="w-8 h-8">
        <img 
          src={profileImage} 
          alt="Profile" 
          className="w-full h-full object-cover rounded-full"
        />
      </Avatar>
    </header>
  )
}

