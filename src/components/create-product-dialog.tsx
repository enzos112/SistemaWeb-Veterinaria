
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/lib/types"
import { BarcodeScannerDialog } from "./barcode-scanner-dialog"
import { ScanBarcode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated: (newProduct: Omit<Product, 'id' | 'imageUrl' | 'salesHistory'> & { barcode?: string }) => void
}

const productFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  barcode: z.string().optional(),
  category: z.enum(["Desinfectantes", "Probióticos", "Antiparasitarios", "Accesorios para mascotas", "Fertilizantes", "Vitaminas", "Medicamentos", "Equipos"]),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo."),
  purchasePrice: z.coerce.number().min(0, "El precio de compra no puede ser negativo."),
  salePrice: z.coerce.number().min(0, "El precio de venta no puede ser negativo."),
  expiryDate: z.string().optional(),
})

export function CreateProductDialog({
  open,
  onOpenChange,
  onProductCreated,
}: CreateProductDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      barcode: "",
      stock: 0,
      purchasePrice: 0,
      salePrice: 0,
      expiryDate: "",
    },
  })

  function onSubmit(values: z.infer<typeof productFormSchema>) {
    onProductCreated(values)
    onOpenChange(false)
    form.reset()
  }

  const handleScan = (scannedBarcode: string) => {
    form.setValue('barcode', scannedBarcode);
    toast({
      title: 'Código de Barras Escaneado',
      description: `El código ${scannedBarcode} ha sido asignado al producto.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) form.reset();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa los datos para añadir un nuevo producto al inventario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Collar de cuero" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras (ID)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Escanea o ingresa el código" {...field} />
                    </FormControl>
                     <BarcodeScannerDialog onScan={handleScan}>
                        <Button type="button" variant="outline" size="icon">
                            <ScanBarcode className="h-4 w-4" />
                        </Button>
                    </BarcodeScannerDialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Desinfectantes">Desinfectantes</SelectItem>
                      <SelectItem value="Probióticos">Probióticos</SelectItem>
                      <SelectItem value="Antiparasitarios">Antiparasitarios</SelectItem>
                      <SelectItem value="Accesorios para mascotas">Accesorios para mascotas</SelectItem>
                      <SelectItem value="Fertilizantes">Fertilizantes</SelectItem>
                      <SelectItem value="Vitaminas">Vitaminas</SelectItem>
                      <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                      <SelectItem value="Equipos">Equipos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock Inicial</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio Compra</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} step="0.01" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio Venta</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} step="0.01" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Añadir Producto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
