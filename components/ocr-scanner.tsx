"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Scan, X, CheckCircle } from "lucide-react"

interface OCRResult {
  invoiceNumber?: string
  date?: string
  subtotal?: number
  vatAmount?: number
  total?: number
  supplierName?: string
  description?: string
}

interface OCRScannerProps {
  onScanComplete: (result: OCRResult) => void
  onClose: () => void
}

export function OCRScanner({ onScanComplete, onClose }: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Simulate OCR processing with realistic invoice data extraction
  const simulateOCR = (imageData: string): Promise<OCRResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate realistic OCR results
        const mockResults: OCRResult[] = [
          {
            invoiceNumber: "INV-2024-001",
            date: new Date().toISOString().split("T")[0],
            subtotal: 1250.0,
            vatAmount: 262.5,
            total: 1512.5,
            supplierName: "Tech Solutions Ltd",
            description: "Software development services",
          },
          {
            invoiceNumber: "INV-2024-002",
            date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
            subtotal: 850.0,
            vatAmount: 178.5,
            total: 1028.5,
            supplierName: "Office Supplies Co",
            description: "Office equipment and supplies",
          },
          {
            invoiceNumber: "BILL-789",
            date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
            subtotal: 2100.0,
            vatAmount: 441.0,
            total: 2541.0,
            supplierName: "Marketing Agency Pro",
            description: "Digital marketing campaign",
          },
        ]

        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
        resolve(randomResult)
      }, 2000)
    })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please use file upload instead.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setScannedImage(imageData)
        stopCamera()
        processImage(imageData)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setScannedImage(imageData)
        processImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageData: string) => {
    setIsScanning(true)
    try {
      const result = await simulateOCR(imageData)
      setOcrResult(result)
    } catch (error) {
      console.error("OCR processing failed:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleUseResults = () => {
    if (ocrResult) {
      onScanComplete(ocrResult)
    }
  }

  const resetScanner = () => {
    setScannedImage(null)
    setOcrResult(null)
    setIsScanning(false)
    stopCamera()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              OCR Invoice Scanner
            </CardTitle>
            <CardDescription>Scan or upload an invoice image to automatically extract data</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!scannedImage && !cameraActive && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={startCamera} className="h-24 flex-col gap-2">
                <Camera className="h-8 w-8" />
                Use Camera
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-24 flex-col gap-2">
                <Upload className="h-8 w-8" />
                Upload Image
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-4">
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                  <p className="text-sm bg-black/50 px-2 py-1 rounded">Position invoice in frame</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {scannedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={scannedImage || "/placeholder.svg"}
                alt="Scanned invoice"
                className="w-full rounded-lg max-h-64 object-contain bg-gray-50"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Processing image...</p>
                  </div>
                </div>
              )}
            </div>

            {ocrResult && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Data Extracted Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ocrResult.invoiceNumber && (
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          Invoice Number
                        </Badge>
                        <p className="font-medium">{ocrResult.invoiceNumber}</p>
                      </div>
                    )}
                    {ocrResult.supplierName && (
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          Supplier
                        </Badge>
                        <p className="font-medium">{ocrResult.supplierName}</p>
                      </div>
                    )}
                    {ocrResult.date && (
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          Date
                        </Badge>
                        <p className="font-medium">{new Date(ocrResult.date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {ocrResult.total && (
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          Total Amount
                        </Badge>
                        <p className="font-medium">€{ocrResult.total.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {ocrResult.description && (
                    <div>
                      <Badge variant="secondary" className="mb-1">
                        Description
                      </Badge>
                      <p className="text-sm">{ocrResult.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUseResults} className="flex-1">
                      Use This Data
                    </Button>
                    <Button variant="outline" onClick={resetScanner}>
                      Scan Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isScanning && !ocrResult && (
              <div className="flex gap-2">
                <Button onClick={() => processImage(scannedImage)} className="flex-1">
                  <Scan className="h-4 w-4 mr-2" />
                  Process Image
                </Button>
                <Button variant="outline" onClick={resetScanner}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
