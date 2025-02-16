"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { connectWallet } from "../../lib/web3"
import { useToast } from "../ui/use-toast"
import React from "react"
export function ConnectWalletButton() {
  const [address, setAddress] = useState<string>("")
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      const { address } = await connectWallet()
      setAddress(address)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
      })
    }
  }

  return (
    <Button onClick={handleConnect} variant="outline">
      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
    </Button>
  )
}

