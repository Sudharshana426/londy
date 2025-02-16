"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore"

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false })

export default function StaffDashboard() {
  const [showScanner, setShowScanner] = useState(false)
  const [laundryStatus, setLaundryStatus] = useState("")
  const [studentName, setStudentName] = useState("")
  const [hostelName, setHostelName] = useState("")
  const [laundryBagNumber, setLaundryBagNumber] = useState("")
  const [laundryDay, setLaundryDay] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [cartStatus, setCartStatus] = useState("Idle")

  useEffect(() => {
    const db = getFirestore()
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const studentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStudents(studentsData)
    })

    return () => unsubscribe()
  }, [])

  const handleScan = async (data: string | null) => {
    if (data) {
      console.log("QR Code scanned:", data)
      const newStatus = "Processing"
      setLaundryStatus(newStatus)
      setShowScanner(false)

      // Update Firestore
      const db = getFirestore()
      await updateDoc(doc(db, "students", data), {
        laundryStatus: newStatus,
      })

      // TODO: Trigger WhatsApp notification
    }
  }

  const handleError = (err: any) => {
    console.error(err)
  }

  const updateLaundryStatus = async (studentId: string, newStatus: string) => {
    const db = getFirestore()
    await updateDoc(doc(db, "students", studentId), {
      laundryStatus: newStatus,
    })
    // TODO: Trigger WhatsApp notification
  }

  const addStudent = async () => {
    const db = getFirestore()
    try {
      await addDoc(collection(db, "students"), {
        name: studentName,
        hostel: hostelName,
        laundryBagNumber,
        laundryDay,
        laundryStatus: "Not Submitted",
      })
      setStudentName("")
      setHostelName("")
      setLaundryBagNumber("")
      setLaundryDay("")
    } catch (error) {
      console.error("Error adding student: ", error)
    }
  }

  const updateCartStatus = (newStatus: string) => {
    setCartStatus(newStatus)
    // TODO: Update cart status in backend
  }

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Staff Dashboard</h2>
      <Button onClick={() => setShowScanner(!showScanner)}>{showScanner ? "Close Scanner" : "Scan QR Code"}</Button>
      {showScanner && (
        <div className="mt-4">
          <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: "100%" }} />
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold">Add Student</h3>
        <div className="space-y-2">
          <Input placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Input placeholder="Hostel Name" value={hostelName} onChange={(e) => setHostelName(e.target.value)} />
          <Input
            placeholder="Laundry Bag Number"
            value={laundryBagNumber}
            onChange={(e) => setLaundryBagNumber(e.target.value)}
          />
          <Input placeholder="Laundry Day" value={laundryDay} onChange={(e) => setLaundryDay(e.target.value)} />
          <Button onClick={addStudent}>Add Student</Button>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Students</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Hostel</th>
              <th className="border border-gray-300 p-2">Bag Number</th>
              <th className="border border-gray-300 p-2">Laundry Day</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border border-gray-300 p-2">{student.name}</td>
                <td className="border border-gray-300 p-2">{student.hostel}</td>
                <td className="border border-gray-300 p-2">{student.laundryBagNumber}</td>
                <td className="border border-gray-300 p-2">{student.laundryDay}</td>
                <td className="border border-gray-300 p-2">{student.laundryStatus}</td>
                <td className="border border-gray-300 p-2">
                  <Button onClick={() => updateLaundryStatus(student.id, "Processing")}>Processing</Button>
                  <Button onClick={() => updateLaundryStatus(student.id, "Ready")}>Ready</Button>
                  <Button onClick={() => updateLaundryStatus(student.id, "Dispatched")}>Dispatched</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Autonomous Cart Status</h3>
        <p>Current Status: {cartStatus}</p>
        <Button onClick={() => updateCartStatus("In Transit")}>Start Transit</Button>
        <Button onClick={() => updateCartStatus("Arrived")}>Mark Arrived</Button>
        <Button onClick={() => updateCartStatus("Idle")}>Set Idle</Button>
      </div>
    </div>
  )
}

