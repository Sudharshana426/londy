"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false })

interface StudentDashboardProps {
  user: any
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [laundryStatus, setLaundryStatus] = useState("Not Submitted")
  const [showScanner, setShowScanner] = useState(false)
  const [studentInfo, setStudentInfo] = useState<any>(null)

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const db = getFirestore()
      const studentDoc = await getDoc(doc(db, "students", user.uid))
      if (studentDoc.exists()) {
        setStudentInfo(studentDoc.data())
        setLaundryStatus(studentDoc.data().laundryStatus || "Not Submitted")
      }
    }
    fetchStudentInfo()
  }, [user])

  const handleScan = async (data: string | null) => {
    if (data) {
      console.log("QR Code scanned:", data)
      const newStatus = "In Transit"
      setLaundryStatus(newStatus)
      setShowScanner(false)

      // Update Firestore
      const db = getFirestore()
      await updateDoc(doc(db, "students", user.uid), {
        laundryStatus: newStatus,
      })

      // TODO: Trigger WhatsApp notification
    }
  }

  const handleError = (err: any) => {
    console.error(err)
  }

  if (!studentInfo) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Student Dashboard</h2>
      <p>Welcome, {studentInfo.name}</p>
      <p>Hostel: {studentInfo.hostel}</p>
      <p>Laundry Bag Number: {studentInfo.laundryBagNumber}</p>
      <p>Laundry Day: {studentInfo.laundryDay}</p>
      <p>Laundry Status: {laundryStatus}</p>
      <Button onClick={() => setShowScanner(!showScanner)}>{showScanner ? "Close Scanner" : "Scan QR Code"}</Button>
      {showScanner && (
        <div className="mt-4">
          <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: "100%" }} />
        </div>
      )}
      <Button onClick={() => setLaundryStatus("Received")}>Confirm Pickup</Button>
    </div>
  )
}

