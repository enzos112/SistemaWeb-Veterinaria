
"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react"
import * as XLSX from "xlsx"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { products as initialProducts, getCurrentUser } from "@/lib/data"
import { SuggestOrderDialog } from "@/components/suggest-order-dialog"
import type { Product, User } from "@/lib/types"
import { CreateProductDialog } from "@/components/create-product-dialog"
import { EditProductDialog } from "@/components/edit-product-dialog"
import { useToast } from "@/hooks/use-toast"
import { parseDate } from "@/lib/utils"

function ProductRow({ product, onEdit, isAdmin }: { product: Product; onEdit: (product: Product) => void; isAdmin: boolean }) {
  const isLowStock = product.stock < 5;
  const isExpiringSoon = product.expiryDate && new Date(product.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 30));
  
  const rowClass = useMemo(() => {
    if (isLowStock) return "bg-destructive/10 hover:bg-destructive/20";
    if (isExpiringSoon) return "bg-yellow-500/10 hover:bg-yellow-500/20";
    return "";
  }, [isLowStock, isExpiringSoon]);


  return (
    <TableRow className={rowClass}>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt={product.name}
          className="aspect-square rounded-md object-cover"
          height="64"
          src={product.imageUrl}
          width="64"
          data-ai-hint={`${product.category.toLowerCase()}`}
        />
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
       <TableCell className="hidden md:table-cell font-mono text-xs">{product.barcode || 'N/A'}</TableCell>
      <TableCell>
        <Badge variant={isLowStock ? "destructive" : "outline"} className={isLowStock ? "" : "text-muted-foreground"}>
          {isLowStock ? `Bajo Stock (${product.stock})` : 'En Stock'}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">S/.{product.purchasePrice.toFixed(2)}</TableCell>
      <TableCell>S/.{product.salePrice.toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
      <TableCell className="hidden md:table-cell">{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="secondary">{product.category}</Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!isAdmin}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {isAdmin && <DropdownMenuItem onClick={() => onEdit(product)}>Editar</DropdownMenuItem>}
            <SuggestOrderDialog product={product} />
            {isAdmin && <DropdownMenuSeparator />}
            {isAdmin && <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        lowStock: false,
        category: 'todos'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
      setCurrentUser(getCurrentUser());
    }, []);
    
    const isAdmin = useMemo(() => currentUser?.role === 'Admin', [currentUser]);
    const productsPerPage = 8;

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode?.includes(searchTerm);
            const matchesLowStock = !filters.lowStock || product.stock < 5;
            const matchesCategory = filters.category === 'todos' || product.category.toLowerCase() === filters.category;
            return matchesSearch && matchesLowStock && matchesCategory;
        });
    }, [searchTerm, filters, products]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * productsPerPage;
        return filteredProducts.slice(startIndex, startIndex + productsPerPage);
    }, [filteredProducts, currentPage, productsPerPage]);

    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({...prev, category: category.toLowerCase() }));
        setCurrentPage(1);
    }
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<any>(worksheet);

                let updatedCount = 0;
                const updatedProductsList = [...initialProducts];

                json.forEach(row => {
                    const productId = row['ID'];
                    const productIndex = updatedProductsList.findIndex(p => p.id === productId);

                    if (productIndex !== -1) {
                        const productToUpdate = updatedProductsList[productIndex];
                        
                        productToUpdate.name = row['Producto'] ?? productToUpdate.name;

                        const barcodeValue = row['Código de Barras'];
                        if (barcodeValue !== undefined) {
                            productToUpdate.barcode = (barcodeValue === 'N/A' || !barcodeValue) ? undefined : String(barcodeValue);
                        }
                        
                        productToUpdate.category = row['Categoría'] ?? productToUpdate.category;
                        productToUpdate.stock = row['Stock'] ?? productToUpdate.stock;
                        productToUpdate.purchasePrice = row['Precio Compra'] ?? productToUpdate.purchasePrice;
                        productToUpdate.salePrice = row['Precio Venta'] ?? productToUpdate.salePrice;
                        
                        if ('Fecha de Vencimiento' in row) {
                            const expiryDateValue = row['Fecha de Vencimiento'];
                            if (expiryDateValue === 'N/A' || !expiryDateValue) {
                                productToUpdate.expiryDate = undefined;
                            } else {
                                const parsed = parseDate(expiryDateValue);
                                if (parsed) {
                                    productToUpdate.expiryDate = parsed;
                                }
                            }
                        }

                        updatedProductsList[productIndex] = productToUpdate;
                        updatedCount++;
                    }
                });
                
                initialProducts.splice(0, initialProducts.length, ...updatedProductsList);
                setProducts(updatedProductsList);

                toast({
                    title: "Importación Exitosa",
                    description: `${updatedCount} productos han sido actualizados.`,
                });

            } catch (error) {
                console.error("Error importing file:", error);
                toast({
                    variant: "destructive",
                    title: "Error de Importación",
                    description: "Hubo un problema al procesar el archivo. Asegúrate de que el formato sea correcto.",
                });
            } finally {
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExport = () => {
        const productsToExport = filteredProducts.map(p => ({
            ID: p.id,
            'Código de Barras': p.barcode || 'N/A',
            Producto: p.name,
            Categoría: p.category,
            Estado: p.stock < 5 ? `Bajo Stock (${p.stock})` : 'En Stock',
            Stock: p.stock,
            "Precio Compra": p.purchasePrice,
            "Precio Venta": p.salePrice,
            'Fecha de Vencimiento': p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(productsToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
        XLSX.writeFile(workbook, "ElAmigo_Inventario.xlsx");
    };

    const handleProductCreated = (newProductData: Omit<Product, 'id' | 'salesHistory' | 'imageUrl'> & { barcode?: string }) => {
        const newProduct: Product = {
            id: `prod-${String(products.length + 1).padStart(3, '0')}`,
            ...newProductData,
            imageUrl: 'https://placehold.co/100x100.png',
            salesHistory: {},
        };
        const newProducts = [newProduct, ...products];
        setProducts(newProducts);
        initialProducts.unshift(newProduct);
    };

    const handleProductUpdated = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        const index = initialProducts.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            initialProducts[index] = updatedProduct;
        }
        setEditingProduct(null);
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
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Panel</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inventario</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
            {isAdmin &&
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleImportClick}>
                    <Upload className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Importar
                    </span>
                </Button>
            }
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
            {isAdmin &&
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsCreateProductOpen(true)}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Añadir Producto
                    </span>
                </Button>
            }
        </div>
      </header>
      <main>
        <Tabs defaultValue="todos" onValueChange={handleCategoryChange}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
              <TabsTrigger value="vitaminas">Vitaminas</TabsTrigger>
              <TabsTrigger value="antiparasitarios">Antiparasitarios</TabsTrigger>
              <TabsTrigger value="fertilizantes">Fertilizantes</TabsTrigger>
              <TabsTrigger value="accesorios para mascotas" className="hidden sm:flex">Accesorios</TabsTrigger>
              <TabsTrigger value="desinfectantes" className="hidden lg:flex">Desinfectantes</TabsTrigger>
              <TabsTrigger value="probióticos" className="hidden lg:flex">Probióticos</TabsTrigger>
              <TabsTrigger value="equipos" className="hidden lg:flex">Equipos</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar por nombre o código..." className="pl-8 sm:w-[300px]" value={searchTerm} onChange={handleSearchChange}/>
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filtrar
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem 
                    checked={filters.lowStock} 
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({ ...prev, lowStock: !!checked }));
                      setCurrentPage(1);
                    }}
                  >
                    Bajo Stock
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value={filters.category} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>
                  Gestiona tus productos y mira su rendimiento de ventas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden sm:table-cell">
                        <span className="sr-only">Imagen</span>
                      </TableHead>
                      <TableHead>Producto</TableHead>
                       <TableHead className="hidden md:table-cell">Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden md:table-cell">Precio Compra</TableHead>
                      <TableHead>Precio Venta</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Stock
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Fecha Venc.
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Categoría
                      </TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length > 0 ? (
                        paginatedProducts.map(product => <ProductRow key={product.id} product={product} onEdit={setEditingProduct} isAdmin={isAdmin} />)
                    ) : (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center h-24">
                                No se encontraron productos.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{paginatedProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0}-{(currentPage - 1) * productsPerPage + paginatedProducts.length}</strong> de <strong>{filteredProducts.length}</strong> productos
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    <CreateProductDialog 
        open={isCreateProductOpen}
        onOpenChange={setIsCreateProductOpen}
        onProductCreated={handleProductCreated}
    />
    <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onProductUpdated={handleProductUpdated}
    />
    </>
  )
}
