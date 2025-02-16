"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import Papa from "papaparse"

export default function StudentDataExtractor() {
  const [file, setFile] = useState<File | null>(null)
  const [extractionStatus, setExtractionStatus] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const extractData = async () => {
    if (!file) {
      setExtractionStatus("No file selected")
      return
    }

    setExtractionStatus("Extracting data...")

    Papa.parse(file, {
      complete: async (results) => {
        const db = getFirestore()
        const studentsRef = collection(db, "students")

        for (let i = 1; i < results.data.length; i++) {
          const [name, hostel, laundryBagNumber, laundryDay] = results.data[i]
          try {
            await addDoc(studentsRef, {
              name,
              hostel,
              laundryBagNumber,
              laundryDay,
              laundryStatus: "Not Submitted",
            })
          } catch (error) {
            console.error("Error adding student: ", error)
          }
        }

        setExtractionStatus("Data extraction complete")
      },
      error: (error) => {
        setExtractionStatus(`Error: ${error.message}`)
      },
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Extract Student Data</h3>
      <Input type="file" accept=".csv" onChange={handleFileChange} />
      <Button onClick={extractData}>Extract Data</Button>
      <p>{extractionStatus}</p>
    </div>
  )
}

