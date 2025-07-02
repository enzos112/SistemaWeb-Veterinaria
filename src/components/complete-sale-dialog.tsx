
"use client"

import { useRef } from "react"
import Image from "next/image"
import { useReactToPrint } from "react-to-print"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer } from "lucide-react"
import type { SaleItem } from "@/lib/types"
import { Receipt } from "./receipt"
import { bankAccounts } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"


interface CompleteSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: SaleItem[]
  total: number
  employee: string
  paymentMethod: string
  onSaleCompleted: () => void
}


export function CompleteSaleDialog({
  open,
  onOpenChange,
  items,
  total,
  employee,
  paymentMethod,
  onSaleCompleted,
}: CompleteSaleDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  })

  const handleConfirmAndPay = () => {
    onSaleCompleted()
    onOpenChange(false)
  }

  const getPaymentMethodName = (method: string) => {
    const names: { [key: string]: string } = {
      efectivo: "Efectivo",
      transferencia: "Transferencia Bancaria",
      yape: "Yape",
      plin: "Plin",
    }
    return names[method] || method
  }

  const renderContent = () => {
    switch (paymentMethod) {
      case "transferencia":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Transferencia Bancaria</DialogTitle>
              <DialogDescription>
                Realiza el pago de <span className="font-bold">S/.{total.toFixed(2)}</span> a una de las siguientes cuentas.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-4 max-h-80 overflow-y-auto">
              {bankAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{account.bankName}</CardTitle>
                    <CardDescription>{account.accountHolder}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1 text-sm">
                    <p><strong>N° de Cuenta:</strong> {account.accountNumber}</p>
                    <p><strong>CCI:</strong> {account.cci}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter className="sm:justify-between gap-2 pt-4">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Boleta
              </Button>
              <Button onClick={handleConfirmAndPay}>
                Confirmar Pago
              </Button>
            </DialogFooter>
          </>
        )
      case "yape":
      case "plin":
        return (
          <>
            <DialogHeader className="text-center">
              <DialogTitle>Pagar con {getPaymentMethodName(paymentMethod)}</DialogTitle>
              <DialogDescription>
                Escanea el código QR o usa el número para pagar S/.{total.toFixed(2)}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <Image
                src="https://placehold.co/200x200.png"
                width={200}
                height={200}
                alt="QR Code"
                className="rounded-lg"
                data-ai-hint="qr code"
              />
              <p className="text-sm text-muted-foreground">
                Número de {getPaymentMethodName(paymentMethod)}:
              </p>
              <p className="text-xl font-bold tracking-widest text-primary">
                987 654 321
              </p>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Boleta
              </Button>
              <Button onClick={handleConfirmAndPay}>Confirmar Pago</Button>
            </DialogFooter>
          </>
        )
      default: // efectivo
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar Venta</DialogTitle>
              <DialogDescription>
                Revisa los detalles de la venta antes de confirmar el pago.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Resumen de Artículos</h4>
                <ul className="space-y-1 text-sm text-muted-foreground max-h-40 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span className="truncate pr-2">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="flex-shrink-0">S/.{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>S/.{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span className="font-medium">{getPaymentMethodName(paymentMethod)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Atendido por:</span>
                <span className="font-medium capitalize">{employee}</span>
              </div>
            </div>
            <DialogFooter className="sm:justify-between gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Boleta
              </Button>
              <Button onClick={handleConfirmAndPay}>Confirmar y Pagar</Button>
            </DialogFooter>
          </>
        )
    }
  }

  return (
    <>
      <div className="hidden">
        <Receipt
          ref={receiptRef}
          items={items}
          total={total}
          employee={employee}
          paymentMethod={getPaymentMethodName(paymentMethod)}
        />
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  )
}
