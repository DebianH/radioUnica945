"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Wheel } from "react-custom-roulette"
import { Calendar } from "@/components/ui/calendar"
// import Calendar from 'react-calendar';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Headphones, Clock, Download, CircleGauge, Trash2 } from "lucide-react"
import * as XLSX from "xlsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function Home() {
  const [djList, setDjList] = useState([])
  const [selectedDjs, setSelectedDjs] = useState([])
  const [mustSpin, setMustSpin] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [numberOfDjsToSelect, setNumberOfDjsToSelect] = useState(8)
  const [currentPrizeNumber, setCurrentPrizeNumber] = useState(0)
  const [availableDjs, setAvailableDjs] = useState([])

  // const handleFileUpload = (event) => {
  //   // const file = event.target.files[0]
  //   const file = await fetch("/djs.xlsx").then((res) => res.blob())
  //   const reader = new FileReader()
  //   reader.onload = (e) => {
  //     const data = new Uint8Array(e.target.result)
  //     const workbook = XLSX.read(data, { type: "array" })
  //     const sheetName = workbook.SheetNames[0]
  //     const worksheet = workbook.Sheets[sheetName]
  //     const json = XLSX.utils.sheet_to_json(worksheet)
  //     const djData = json.map((dj) => ({ option: `${dj["Nombre y Apellido"]} (${dj["Pseudonimo"]})` }))
  //     setDjList(djData)
  //     setAvailableDjs(djData)
  //   }
  //   reader.readAsArrayBuffer(file)
  // }

  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        const response = await fetch("/djs.xlsx")
        const arrayBuffer = await response.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        const djData = json.map((dj) => ({ option: `${dj["Nombre y Apellido"]} (${dj["Pseudonimo"]})` }))
        setDjList(djData)
        setAvailableDjs(djData)
      } catch (error) {
        console.error("Error loading Excel file:", error)
      }
    }

    loadExcelFile()
  }, [])

  const handleSpinClick = () => {
    if (availableDjs.length > 0 && !mustSpin) {
      setMustSpin(true)
    }
  }

  const getTimeSlot = (position) => {
    const baseTime = new Date(selectedDate)
    baseTime.setHours(9, 0, 0, 0) // Set base time to 9:00 AM
    baseTime.setMinutes(baseTime.getMinutes() + (position - 1) * 30)
    return baseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleStopSpinning = () => {
    setMustSpin(false)
    if (availableDjs.length === 0) {
      console.log("No more DJs available")
      return
    }
    const winnerIndex = Math.floor(Math.random() * availableDjs.length)
    const winner = availableDjs[winnerIndex]
    const newPrizeNumber = currentPrizeNumber + 1
    setSelectedDjs([
      ...selectedDjs,
      {
        ...winner,
        date: selectedDate,
        prizeNumber: newPrizeNumber,
        timeSlot: getTimeSlot(newPrizeNumber),
      },
    ])
    setCurrentPrizeNumber(newPrizeNumber)

    // Remove the selected DJ from the available list
    setAvailableDjs(availableDjs.filter((_, index) => index !== winnerIndex))

    if (newPrizeNumber < numberOfDjsToSelect && availableDjs.length > 1) {
      setTimeout(() => setMustSpin(true), 1000)
    } else {
      setCurrentPrizeNumber(0)
    }
  }

  const exportToPDF = () => {
    const filteredDjs = selectedDjs.filter((dj) => dj.date.toDateString() === selectedDate.toDateString())
    const pdf = new jsPDF()

    // Add logo (now using PNG format)
    const logoUrl = "/LOGO-NUEVA-UNICA-TRANSPARENCIA-1X1-PARA-REDES.png"
    pdf.addImage(logoUrl, "PNG", 10, 10, 40, 40)

    // Set font and add title
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(18)
    pdf.text("DJs Seleccionados", pdf.internal.pageSize.width / 2, 60, { align: "center" })

    // Add date
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Fecha: ${selectedDate.toLocaleDateString()}`, pdf.internal.pageSize.width / 2, 70, { align: "center" })

    // Create table
    const tableData = filteredDjs.map((dj, index) => [index + 1, dj.option, dj.timeSlot])

    pdf.autoTable({
      startY: 80,
      head: [["#", "DJ", "Horario"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0], textColor: 255 },
      styles: { halign: "center" },
      margin: { top: 80, right: 15, bottom: 15, left: 15 },
    })
    pdf.save(`DJs_Seleccionados_${selectedDate.toLocaleDateString()}.pdf`)
  }

  const handleClearSelectedDjs = () => {
    setSelectedDjs([])
    setAvailableDjs(djList)
    setCurrentPrizeNumber(0)
  }

  const handleDateSelect = (date: any) => {
    // Si la fecha es undefined (por ejemplo, al hacer doble clic), mantenemos la fecha actual
    setSelectedDate(date || selectedDate)
  }

  console.log("sele", selectedDate)
  return (
    <div className="bg-white text-red-600">
      <div className="fixed top-0 left-0 right-0 bg-[#e10001] text-white p-0 flex items-center justify-center width-full gap-8 z-10 ">
        <Image src="/LOGO-LOS-CUENTOS-DE-LA-CHICHA-SOLO-SIN-FONDO.png" alt="Logo de los Cuentos de la Chicha" width={100} height={100} className="" />
        <h1 className="text-4xl font-bold ">Los Cuentos de la Chicha</h1>
        <Image src="/LOGO-NUEVA-UNICA-TRANSPARENCIA-1X1-PARA-REDES.png" alt="Logo de los Cuentos de la Chicha" width={100} height={100} className="" />
      </div>

      <main className="container mx-auto px-4 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {/* <Label htmlFor="file-upload" className="mb-2">
              Cargar lista de DJs (Excel)
            </Label>
            <Input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" /> */}

            {djList.length > 0 && (
              <div className="w-full max-w-md mt-8 ">
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={currentPrizeNumber}
                  data={availableDjs}
                  onStopSpinning={handleStopSpinning}
                  backgroundColors={["#FFFFFF", "#FF0000"]}
                  textColors={["#FF0000", "#FFFFFF"]}
                  outerBorderColor="#FF0000"
                  radiusLineColor="#FF0000"
                  fontSize={10}
                />
                <Button
                  onClick={handleSpinClick}
                  className="mt-8 w-full bg-[#75e90c] text-white"
                  disabled={currentPrizeNumber !== 0 || mustSpin || availableDjs.length === 0}
                >
                  <CircleGauge className="mr-2" />
                  ¡Girar la Ruleta!
                </Button>
              </div>
            )}
          </div>

          <div>
            <div className="my-4 text-center">
              Número de Djs a seleccionar: <b>8</b>
              {/* <Label htmlFor="dj-count">Número de DJs a sortear</Label>
              <Select onValueChange={(value) => setNumberOfDjsToSelect(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona la cantidad" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>

            <h2 className="text-2xl font-bold mb-4 text-center">DJs Seleccionados para {selectedDate.toLocaleDateString()}</h2>
            <ul className="space-y-2 mb-6">
              {selectedDjs
                .filter((dj) => dj.date.toDateString() === selectedDate.toDateString())
                .map((dj, index) => (
                  <li key={index} className="flex items-center justify-between bg-red-100 p-2 rounded">
                    <div className="flex items-center">
                      <Headphones className="mr-2" />
                      <span>{dj.option}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1" />
                      <span>{dj.timeSlot}</span>
                    </div>
                  </li>
                ))}
            </ul>

            {selectedDjs.length > 0 && currentPrizeNumber === 0 && (
              <Button onClick={exportToPDF} className="mb-4 w-full">
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
            )}

            <div className="mb-4 flex flex-col items-center">
              <Label className="text-center mb-4">Fecha de Participación</Label>
              <div className="flex items-center space-x-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border w-fit "
                />
              </div>
            </div>
            <div className=" flex items-center justify-center w-auto">
              <Button onClick={handleClearSelectedDjs} disabled={selectedDjs.length === 0} variant="outline">
                <Trash2 className="mr-2 h-4 w-4" /> Limpiar
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

