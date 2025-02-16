'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  User
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  signup: (email: string, password: string, username: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signup = async (email: string, password: string, username: string) => {
    try {
      // Check if email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length > 0) {
        throw new Error('Email already in use. Please login instead.')
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        profileImage: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200`,
        createdAt: new Date().toISOString()
      })

    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email')
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password')
      }
      throw new Error(error.message || 'Failed to login')
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout')
    }
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 