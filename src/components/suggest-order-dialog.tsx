"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"

import type { Product } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { getSuggestedQuantity } from "@/app/(app)/inventory/actions"
import type { SuggestOrderQuantitiesOutput } from "@/ai/flows/suggest-order-quantities"
import { Skeleton } from "./ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export function SuggestOrderDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestOrderQuantitiesOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSuggestion = async () => {
    setIsLoading(true)
    setError(null)
    setSuggestion(null)
    try {
      const seasonalTrends = {
        "1": 1.0, "2": 1.0, "3": 1.2, "4": 1.3, "5": 1.4, "6": 1.5,
        "7": 1.4, "8": 1.3, "9": 1.2, "10": 1.1, "11": 1.2, "12": 1.3
      };
      
      const result = await getSuggestedQuantity({
        productId: product.id,
        currentStockLevel: product.stock,
        historicalSalesData: JSON.stringify(product.salesHistory),
        seasonalTrends: JSON.stringify(seasonalTrends),
      })
      setSuggestion(result)
    } catch (e) {
      setError("No se pudo obtener la sugerencia. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Sugerir Cantidad de Pedido
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sugerencia de Pedido con IA</DialogTitle>
          <DialogDescription>
            Obtén una sugerencia generada por IA sobre cuánto pedir de <span className="font-bold">{product.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!suggestion && !isLoading && !error && (
            <div className="text-center p-4 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Haz clic en el botón de abajo para generar una sugerencia.</p>
            </div>
          )}
          {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {error && <Alert variant="destructive">{error}</Alert>}
          {suggestion && (
            <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertTitle className="text-xl">
                Pedir <span className="font-bold text-primary">{suggestion.suggestedOrderQuantity}</span> unidades
              </AlertTitle>
              <AlertDescription>
                {suggestion.reasoning}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSuggestion} disabled={isLoading}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? "Pensando..." : "Generar Sugerencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
