"use client"

import { useState, useEffect } from "react"
import Login from "../components/Login"
import StudentDashboard from "../components/StudentDashboard"
import StaffDashboard from "../components/StaffDashboard"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"

// ✅ Correct Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAQx2u1iDwjJz9DgEi_o9XfxWCi2L_U74",
  authDomain: "londy-laundry-system.firebaseapp.com",
  projectId: "londy-laundry-system",
  storageBucket: "londy-laundry-system.firebasestorage.app",
  messagingSenderId: "149675692958",
  appId: "1:149675692958:web:cfa6569a70cfa3e05cbc8f"
}

// ✅ Initialize Firebase (Prevent duplicate initialization)
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setCurrentUser({ ...user, role: userDoc.data().role })
        } else {
          setCurrentUser(user) // Default if no role found
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!currentUser) return <Login />
  if (currentUser.role === "student") return <StudentDashboard user={currentUser} />
  if (currentUser.role === "staff") return <StaffDashboard />

  return <div>Unauthorized access</div>
}
