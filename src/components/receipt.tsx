
import React from 'react';
import type { SaleItem } from '@/lib/types';
import { PawPrint } from 'lucide-react';

interface ReceiptProps {
  items: SaleItem[];
  total: number;
  employee: string;
  paymentMethod: string;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ items, total, employee, paymentMethod }, ref) => {
    const currentDate = new Date().toLocaleString('es-ES');

    return (
      <div ref={ref} className="p-8 font-mono text-xs text-black bg-white">
        <style type="text/css" media="print">
          {"@page { size: 80mm auto; margin: 0; } body { margin: 1.6cm; }"}
        </style>
        <div className="text-center space-y-2 mb-6">
          <PawPrint className="h-10 w-10 mx-auto" />
          <h1 className="text-xl font-bold">El amigo</h1>
          <p>Veterinaria y Pet Shop</p>
          <p>Av. Siempre Viva 123, Springfield</p>
          <p>Tel: (555) 123-4567</p>
        </div>
        <div className="mb-4">
          <p>----------------------------------------</p>
          <div className="flex justify-between">
            <span>Fecha: {currentDate}</span>
            <span className="capitalize">Cajero: {employee}</span>
          </div>
          <p>----------------------------------------</p>
        </div>
        <div className="space-y-1 mb-4">
          <div className="grid grid-cols-12 gap-2 font-bold">
            <div className="col-span-1">C.</div>
            <div className="col-span-6">Descripción</div>
            <div className="col-span-2 text-right">P.U.</div>
            <div className="col-span-3 text-right">Subtotal</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2">
              <div className="col-span-1">{item.quantity}</div>
              <div className="col-span-6">{item.name}</div>
              <div className="col-span-2 text-right">S/.{item.price.toFixed(2)}</div>
              <div className="col-span-3 text-right">S/.{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-black pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-base font-bold">
                <span>TOTAL:</span>
                <span>S/.{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Método de Pago:</span>
                <span>{paymentMethod}</span>
            </div>
        </div>
        <div className="text-center mt-8">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
