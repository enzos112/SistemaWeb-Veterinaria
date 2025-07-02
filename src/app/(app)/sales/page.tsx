
"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { products, sales, users } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2, ScanBarcode } from "lucide-react"
import type { Sale, SaleItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { BarcodeScannerDialog } from "@/components/barcode-scanner-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CompleteSaleDialog } from "@/components/complete-sale-dialog"

function SaleItemRow({ 
  item, 
  onItemChange, 
  onRemove,
  availableProducts
}: { 
  item: SaleItem; 
  onItemChange: (id: string, updatedValues: Partial<SaleItem>) => void; 
  onRemove: (id: string) => void;
  availableProducts: typeof products;
}) {
  return (
    <div className="grid grid-cols-[1fr_80px_100px_auto] items-center gap-3">
        <Select
          value={item.productId}
          onValueChange={(productId) => onItemChange(item.id, { productId })}
        >
            <SelectTrigger aria-label="Seleccionar producto">
                <SelectValue placeholder="Seleccionar un producto" />
            </SelectTrigger>
            <SelectContent>
                {availableProducts.map(p => (
                    <SelectItem key={p.id} value={p.id} disabled={p.stock === 0}>{p.name} ({p.stock} disponibles)</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Input 
          type="number" 
          value={item.quantity} 
          onChange={(e) => onItemChange(item.id, { quantity: parseInt(e.target.value, 10) || 1 })}
          className="w-full text-center" 
          min="1"
          max={item.stock}
          disabled={!item.productId}
        />
        <Input 
          type="text" 
          readOnly 
          value={item.productId ? `S/.${(item.price * item.quantity).toFixed(2)}` : 'S/.0.00' }
          className="w-full font-mono text-right" 
          disabled={!item.productId}
        />
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
    </div>
  )
}


export default function SalesPage() {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [employee, setEmployee] = useState("donato");
    const [paymentMethod, setPaymentMethod] = useState("efectivo");
    const [isSaleConfirmationDialogOpen, setIsSaleConfirmationDialogOpen] = useState(false);
    const [salesHistory, setSalesHistory] = useState<Sale[]>(sales);
    const { toast } = useToast();
    
    const employees = users.filter(u => u.role === "Empleado" || u.role === "Admin");

    const handleAddItem = () => {
        setItems([...items, { id: crypto.randomUUID(), productId: "", name: "", quantity: 1, price: 0, stock: 0 }]);
    };
    
    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, updatedValues: Partial<SaleItem>) => {
      setItems(items.map(item => {
        if (item.id === id) {
          let newItem = { ...item, ...updatedValues };

          if (updatedValues.productId) {
            const product = products.find(p => p.id === updatedValues.productId);
            if (product) {
              newItem = {
                ...newItem,
                name: product.name,
                price: product.salePrice,
                stock: product.stock,
                quantity: 1, 
              };
            }
          }

          if (updatedValues.quantity !== undefined) {
              if(updatedValues.quantity > newItem.stock) {
                  toast({
                      variant: 'destructive',
                      title: 'Límite de stock alcanzado',
                      description: `${newItem.name} solo tiene ${newItem.stock} unidades en stock.`,
                  });
                  newItem.quantity = newItem.stock;
              }
              if (updatedValues.quantity < 1) {
                  newItem.quantity = 1;
              }
          }
          return newItem;
        }
        return item;
      }));
    };

    const handleScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            const existingItem = items.find(item => item.productId === product.id);
            if (existingItem) {
                handleItemChange(existingItem.id, { quantity: existingItem.quantity + 1 });
            } else {
                setItems(prevItems => [
                    ...prevItems,
                    {
                        id: crypto.randomUUID(),
                        productId: product.id,
                        name: product.name,
                        quantity: 1,
                        price: product.salePrice,
                        stock: product.stock,
                    },
                ]);
            }
            toast({
                title: 'Producto Añadido',
                description: `${product.name} ha sido añadido al carrito.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Producto no encontrado',
                description: `No se encontró ningún producto con el código de barras ${barcode}.`,
            });
        }
    };

    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [items]);
    
    const handleCompleteSale = () => {
        if (items.length === 0 || items.some(i => !i.productId)) {
            toast({
                variant: 'destructive',
                title: 'No se puede completar la venta',
                description: 'Por favor, añade productos válidos a la venta antes de completarla.',
            });
            return;
        }
        setIsSaleConfirmationDialogOpen(true);
    };

    const handleSaleCompleted = () => {
        const newSales: Sale[] = items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                id: `sale-${crypto.randomUUID().slice(0, 8)}`,
                productId: item.productId,
                productName: item.name,
                productImage: product.imageUrl,
                quantity: item.quantity,
                totalPrice: item.price * item.quantity,
                date: new Date().toISOString(),
                employee: employees.find(e => e.name.toLowerCase() === employee)?.name || 'Desconocido',
            };
        });

        // Prepend new sales to the global data source to be available for the stats page
        sales.unshift(...newSales);

        // Update local state to re-render the history list on this page
        setSalesHistory(prevHistory => [...newSales, ...prevHistory]);

        const paymentMethodName = {
            efectivo: "Efectivo",
            transferencia: "Transferencia Bancaria",
            yape: "Yape",
            plin: "Plin"
        }[paymentMethod] || paymentMethod;

        toast({
            title: '¡Venta Completada!',
            description: `Total: S/.${total.toFixed(2)} pagado con ${paymentMethodName}.`,
        });
        setItems([]);
    };

    return (
      <>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                  <div className="flex justify-between items-center">
                      <div>
                          <CardTitle>Punto de Venta</CardTitle>
                          <CardDescription>
                              Crea una nueva venta para un cliente.
                          </CardDescription>
                      </div>
                       <BarcodeScannerDialog onScan={handleScan}>
                          <Button variant="outline">
                              <ScanBarcode className="mr-2 h-4 w-4" />
                              Escanear Producto
                          </Button>
                      </BarcodeScannerDialog>
                  </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="employee">Empleado</Label>
                  <Select value={employee} onValueChange={setEmployee}>
                    <SelectTrigger
                      id="employee"
                      aria-label="Seleccionar empleado"
                    >
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.name.toLowerCase()}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator/>
                <div className="grid gap-3">
                    <Label>Artículos de la Venta</Label>
                    <div className="grid gap-4">
                      {items.map(item => (
                        <SaleItemRow 
                          key={item.id} 
                          item={item} 
                          onItemChange={handleItemChange} 
                          onRemove={handleRemoveItem}
                          availableProducts={products.filter(p => p.stock > 0 || p.id === item.productId)}
                        />
                      ))}
                      {items.length === 0 && (
                        <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                          No hay artículos en esta venta.
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-fit mt-2" onClick={handleAddItem}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Artículo
                    </Button>
                </div>
                 <Separator/>
                <div className="grid gap-3">
                    <Label>Método de Pago</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="efectivo" id="r1" />
                            <Label htmlFor="r1">Efectivo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="transferencia" id="r2" />
                            <Label htmlFor="r2">Transferencia Bancaria</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yape" id="r3" />
                            <Label htmlFor="r3">Yape</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="plin" id="r4" />
                            <Label htmlFor="r4">Plin</Label>
                        </div>
                    </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-lg font-semibold">Total: <span className="font-mono text-primary">S/.{total.toFixed(2)}</span></div>
                  <Button onClick={handleCompleteSale} disabled={items.length === 0}>Completar Venta</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ventas</CardTitle>
              <CardDescription>
                Un registro de todas las transacciones de venta recientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {salesHistory.slice(0, 10).map((sale) => (
                          <TableRow key={sale.id}>
                              <TableCell>
                                  <div className="flex items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                          <AvatarImage src={sale.productImage} alt={sale.productName} data-ai-hint="pet food" />
                                          <AvatarFallback>{sale.productName.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <div className="font-medium">{sale.productName}</div>
                                          <div className="text-sm text-muted-foreground">
                                              {new Date(sale.date).toLocaleString()}
                                          </div>
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">S/.{sale.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
          </div>
        </div>
        <CompleteSaleDialog
            open={isSaleConfirmationDialogOpen}
            onOpenChange={setIsSaleConfirmationDialogOpen}
            items={items}
            total={total}
            employee={employee}
            paymentMethod={paymentMethod}
            onSaleCompleted={handleSaleCompleted}
        />
      </>
    )
  }
