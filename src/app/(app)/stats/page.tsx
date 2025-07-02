
"use client"

import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import type { DateRange } from 'react-day-picker';
import { format, startOfWeek, getWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from "xlsx";
import { ArrowDownRight, ArrowUpRight, File, Scale } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { products, sales, orders } from '@/lib/data';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 29)),
    to: new Date(),
  });

  const filteredSales = useMemo(() => {
      if (!dateRange?.from) return [];
      const from = dateRange.from;
      const to = dateRange.to ?? from;
      return sales.filter(sale => isWithinInterval(new Date(sale.date), { start: from, end: to }));
  }, [dateRange]);

  const topSellingProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string, quantity: number } } = {};
    filteredSales.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = { name: sale.productName, quantity: 0 };
      }
      productSales[sale.productId].quantity += sale.quantity;
    });
    return Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [filteredSales]);
  
  const financialSummary = useMemo(() => {
    const totalIncome = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    const from = dateRange?.from;
    const to = dateRange?.to ?? from;
    const filteredOrders = from ? orders.filter(order => order.status === 'Completado' && isWithinInterval(new Date(order.date), { start: from, end: to })) : [];
    
    const totalExpenses = filteredOrders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.purchasePrice * item.quantity, 0);
    }, 0);

    const netProfit = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netProfit };
  }, [filteredSales, dateRange]);
  
  const weeklySalesData = useMemo(() => {
    const weeklySales: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      const weekStartDate = startOfWeek(new Date(sale.date), { weekStartsOn: 1 });
      const weekKey = format(weekStartDate, 'yyyy-MM-dd');
      if (!weeklySales[weekKey]) {
        weeklySales[weekKey] = 0;
      }
      weeklySales[weekKey] += sale.totalPrice;
    });
    
    const sortedWeeks = Object.keys(weeklySales).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return sortedWeeks.map(week => ({
        name: `Sem ${getWeek(new Date(week), { weekStartsOn: 1 })}`,
        total: weeklySales[week],
    }));
  }, [filteredSales]);

  const handleSalesExport = () => {
    const dataToExport = filteredSales.map(sale => ({
        'ID Venta': sale.id,
        'Fecha': format(new Date(sale.date), 'yyyy-MM-dd HH:mm'),
        'Producto': sale.productName,
        'Cantidad': sale.quantity,
        'Precio Total': sale.totalPrice,
        'Empleado': sale.employee,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, `ElAmigo_Ventas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold">Estadísticas</h1>
                <p className="text-muted-foreground">Analiza el rendimiento de tu negocio.</p>
            </div>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} className="max-w-sm w-full sm:w-auto" />
        </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">S/.{financialSummary.totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Ingresos por ventas en el período seleccionado.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">S/.{financialSummary.totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Costos de pedidos completados en el período.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
                <Scale className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>S/.{financialSummary.netProfit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Ingresos menos egresos en el período.</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Ventas Semanales</CardTitle>
            <CardDescription>Total de ingresos generados por semana.</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={weeklySalesData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `S/.${value}`} />
                <RechartsTooltip cursor={{ fill: 'hsla(var(--primary), 0.1)' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Los 5 productos más vendidos por unidades en el período.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Vendidas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topSellingProducts.length > 0 ? topSellingProducts.map(p => (
                            <TableRow key={p.name}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-right">{p.quantity}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">No hay datos de ventas.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Historial de Ventas Detallado</CardTitle>
                    <CardDescription>Explora y exporta el historial completo de ventas del período seleccionado.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={handleSalesExport} disabled={filteredSales.length === 0}>
                    <File className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="max-h-[400px] overflow-auto relative border rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium">{sale.productName}</TableCell>
                                    <TableCell>{format(new Date(sale.date), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                                    <TableCell className="text-right">{sale.quantity}</TableCell>
                                    <TableCell className="text-right">S/.{sale.totalPrice.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No hay ventas en el rango de fechas seleccionado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
