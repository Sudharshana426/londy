"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface LaundryItem {
  id: string
  studentName: string
  hostelName: string
  status: string
}

export default function CommonDashboard() {
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // TODO: Fetch laundry items from backend
    const dummyData: LaundryItem[] = [
      { id: "1", studentName: "John Doe", hostelName: "A Block", status: "Given" },
      { id: "2", studentName: "Jane Smith", hostelName: "B Block", status: "Missed" },
      { id: "3", studentName: "Bob Johnson", hostelName: "C Block", status: "Ready" },
      { id: "4", studentName: "Alice Brown", hostelName: "D Block", status: "Received" },
    ]
    setLaundryItems(dummyData)
  }, [])

  const filteredItems = laundryItems.filter(
    (item) => filter === "all" || item.status.toLowerCase() === filter.toLowerCase(),
  )

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Common Dashboard</h2>
      <div className="space-x-2">
        <Button onClick={() => setFilter("all")}>All</Button>
        <Button onClick={() => setFilter("Given")}>Given</Button>
        <Button onClick={() => setFilter("Missed")}>Missed</Button>
        <Button onClick={() => setFilter("Ready")}>Ready</Button>
        <Button onClick={() => setFilter("Received")}>Received</Button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Student Name</th>
            <th className="border border-gray-300 p-2">Hostel</th>
            <th className="border border-gray-300 p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{item.studentName}</td>
              <td className="border border-gray-300 p-2">{item.hostelName}</td>
              <td className="border border-gray-300 p-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

