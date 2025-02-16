import { ethers } from "ethers"

export const connectWallet = async (): Promise<{ address: string }> => {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found")
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  
  return { address }
}

export const disconnectWallet = () => {
  // Clear wallet state
  return null
}

