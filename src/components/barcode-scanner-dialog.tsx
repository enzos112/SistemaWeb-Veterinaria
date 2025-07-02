"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ScanBarcode } from "lucide-react"

interface BarcodeScannerDialogProps {
  onScan: (barcode: string) => void
  children: React.ReactNode
}

export function BarcodeScannerDialog({ onScan, children }: BarcodeScannerDialogProps) {
  const [open, setOpen] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef(new BrowserMultiFormatReader())
  const { toast } = useToast()

  useEffect(() => {
    let isCancelled = false
    const codeReader = codeReaderRef.current

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          codeReader.decodeFromVideoElement(videoRef.current, (result, err) => {
            if (result) {
              onScan(result.getText())
              setOpen(false) 
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.error(err)
              toast({
                variant: 'destructive',
                title: 'Error de Escaneo',
                description: 'No se pudo escanear el código de barras.',
              });
            }
          })
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCameraPermission(false)
      }
    }

    if (open) {
      setupCamera()
    } else {
      codeReader.reset()
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
    }

    return () => {
      isCancelled = true
      codeReader.reset()
    }
  }, [open, onScan, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código de barras del producto.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video">
          <video ref={videoRef} className="w-full h-full rounded-md bg-muted" autoPlay playsInline />
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
               <Alert variant="destructive" className="w-4/5">
                <AlertTitle>Se Requiere Acceso a la Cámara</AlertTitle>
                <AlertDescription>
                  Por favor, permite el acceso a la cámara para usar esta función.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
