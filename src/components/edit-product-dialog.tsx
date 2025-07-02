
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
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

interface EditProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated: (updatedProduct: Product) => void
}

const productFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  category: z.enum(["Desinfectantes", "Probióticos", "Antiparasitarios", "Accesorios para mascotas", "Fertilizantes", "Vitaminas", "Medicamentos", "Equipos"]),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo."),
  purchasePrice: z.coerce.number().min(0, "El precio de compra no puede ser negativo."),
  salePrice: z.coerce.number().min(0, "El precio de venta no puede ser negativo."),
  expiryDate: z.string().optional(),
})

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: EditProductDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
  })

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : "",
      })
      setImagePreview(product.imageUrl)
    }
  }, [product, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof productFormSchema>) {
    if (product) {
      onProductUpdated({
          ...product,
          ...values,
          expiryDate: values.expiryDate,
          imageUrl: imagePreview || product.imageUrl,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Actualiza los detalles del producto.
          </DialogDescription>
        </DialogHeader>
        {product && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormItem>
                  <FormLabel>Imagen del Producto</FormLabel>
                  <div className="flex items-center gap-4">
                    {imagePreview && <Image src={imagePreview} alt="Vista previa" width={64} height={64} className="rounded-md aspect-square object-cover" />}
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs file:text-primary file:font-semibold"/>
                    </FormControl>
                  </div>
                </FormItem>
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
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
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
                                <Input type="number" {...field} step="0.01" />
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
                                <Input type="number" {...field} step="0.01" />
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
                <Button type="submit">Guardar Cambios</Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
