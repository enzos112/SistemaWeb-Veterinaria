
"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { MoreHorizontal, PlusCircle, File } from "lucide-react"
import * as XLSX from "xlsx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { orders as initialOrders, products as initialProducts } from "@/lib/data"
import type { Order, OrderItem } from "@/lib/types"
import { CreateOrderDialog } from "@/components/create-order-dialog"
import { useToast } from "@/hooks/use-toast"

const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "Pendiente":
      return "secondary";
    case "Completado":
      return "default";
    case "Cancelado":
      return "destructive";
    default:
      return "outline";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [importingOrderId, setImportingOrderId] = useState<string | null>(null);

  const handleOrderCreated = (newOrderData: { supplier?: string; items: Omit<OrderItem, 'name' | 'purchasePrice'>[] }) => {
    const newOrder: Order = {
        id: `ord-${String(orders.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        status: 'Pendiente',
        supplier: newOrderData.supplier,
        items: newOrderData.items.map(item => {
            const product = initialProducts.find(p => p.id === item.productId);
            return {
                ...item,
                name: product?.name || 'Producto Desconocido',
                purchasePrice: product?.purchasePrice || 0,
            };
        }),
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    initialOrders.unshift(newOrder);
  };
  
  const handleExportAll = () => {
    const dataToExport = orders.flatMap(order => 
      order.items.map(item => ({
        'ID Pedido': order.id,
        'Proveedor': order.supplier || 'N/A',
        'Estado': order.status,
        'Fecha': new Date(order.date).toLocaleDateString('es-ES'),
        'ID Producto': item.productId,
        'Producto': item.name,
        'Cantidad': item.quantity,
        'Precio Compra': item.purchasePrice,
        'Subtotal': item.purchasePrice * item.quantity,
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
    XLSX.writeFile(workbook, "ElAmigo_Todos_Pedidos.xlsx");
  };

  const handleExportSingle = (order: Order) => {
    // 1. Prepare data for columns A-D, leaving 'Precio Compra Unit.' empty.
    const dataForSheet = order.items.map(item => ({
        'ID Producto': item.productId,
        'Producto': item.name,
        'Cantidad': item.quantity,
        'Precio Compra Unit.': null, // This will be an empty cell for the user to fill
    }));

    // 2. Create worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

    // 3. Add the 'Subtotal' header to column E
    XLSX.utils.sheet_add_aoa(worksheet, [['Subtotal']], { origin: 'E1' });
    
    // 4. Add the formula to each row in the 'Subtotal' column
    order.items.forEach((_, index) => {
      const rowIndex = index + 2; // Data starts at row 2 (1-based index)
      const cellAddress = `E${rowIndex}`;
      // Formula: C * D
      worksheet[cellAddress] = { t: 'n', f: `C${rowIndex}*D${rowIndex}` };
    });
    
    // 5. Create workbook and write file
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Pedido ${order.id}`);
    XLSX.writeFile(workbook, `ElAmigo_Pedido_${order.id}.xlsx`);
  }

  const triggerOrderImport = (orderId: string) => {
    setImportingOrderId(orderId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !importingOrderId) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<{ 'ID Producto': string; 'Precio Compra Unit.': number }>(worksheet);

            const orderIndex = initialOrders.findIndex(o => o.id === importingOrderId);
            if (orderIndex === -1) {
                throw new Error("Pedido no encontrado para importar.");
            }

            const updatedOrder = JSON.parse(JSON.stringify(initialOrders[orderIndex]));
            
            json.forEach(importedItem => {
                const productId = importedItem['ID Producto'];
                const newPrice = importedItem['Precio Compra Unit.'];

                if (productId && typeof newPrice === 'number' && newPrice >= 0) {
                    const orderItem = updatedOrder.items.find((i: OrderItem) => i.productId === productId);
                    if (orderItem) {
                        orderItem.purchasePrice = newPrice;
                        
                        const productIndex = initialProducts.findIndex(p => p.id === productId);
                        if (productIndex !== -1) {
                            initialProducts[productIndex].stock += orderItem.quantity;
                            initialProducts[productIndex].purchasePrice = newPrice;
                        }
                    }
                }
            });

            updatedOrder.status = 'Completado';
            initialOrders[orderIndex] = updatedOrder;
            setOrders([...initialOrders]);

            toast({
                title: "Importación Exitosa",
                description: `Pedido ${importingOrderId} completado. Precios y stock actualizados. Los egresos han sido actualizados.`,
            });

        } catch (error) {
            console.error("Error importing file:", error);
            const errorMessage = error instanceof Error ? error.message : "Hubo un problema al procesar el archivo. Asegúrate de que tenga el formato correcto y los precios unitarios rellenados.";
            toast({
                variant: "destructive",
                title: "Error de Importación",
                description: errorMessage,
            });
        } finally {
          if(fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setImportingOrderId(null);
        }
    };
    reader.readAsBinaryString(file);
  };


  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".xlsx, .xls"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
              Gestiona y sigue tus pedidos de compra de productos.
              </CardDescription>
          </div>
          <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExportAll}>
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar Todo
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" onClick={() => setIsCreateOrderOpen(true)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Crear Pedido
                </span>
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead className="hidden md:table-cell">Proveedor</TableHead>
                <TableHead>Nº Artículos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell className="hidden md:table-cell">{order.supplier || 'N/A'}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                            <Link href={`/orders/${order.id}`}>Ver Detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleExportSingle(order)}>Exportar Pedido</DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => triggerOrderImport(order.id)}
                            disabled={order.status !== 'Pendiente'}
                        >
                            Importar y Completar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CreateOrderDialog 
        open={isCreateOrderOpen}
        onOpenChange={setIsCreateOrderOpen}
        onOrderCreated={handleOrderCreated}
      />
    </>
  )
}
