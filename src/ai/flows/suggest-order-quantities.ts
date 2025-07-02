'use server';

/**
 * @fileOverview Un agente de IA que sugiere cantidades óptimas de pedido para productos basándose en datos históricos de ventas y niveles de inventario actuales.
 *
 * - suggestOrderQuantities - Una función que sugiere cantidades de pedido para productos.
 * - SuggestOrderQuantitiesInput - El tipo de entrada para la función suggestOrderQuantities.
 * - SuggestOrderQuantitiesOutput - El tipo de retorno para la función suggestOrderQuantities.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOrderQuantitiesInputSchema = z.object({
  productId: z.string().describe('The ID of the product to suggest an order quantity for.'),
  currentStockLevel: z.number().describe('The current stock level of the product.'),
  historicalSalesData: z
    .string()
    .describe(
      'Historical sales data for the product, as a JSON string.  The keys should be dates (YYYY-MM-DD), and the values should be the number of units sold on that date.'
    ),
  seasonalTrends: z
    .string()
    .optional()
    .describe(
      'Seasonal trends affecting the product, as a JSON string. The keys should be months (1-12), and the values should be a multiplier indicating the expected change in sales for that month.'
    ),
});
export type SuggestOrderQuantitiesInput = z.infer<typeof SuggestOrderQuantitiesInputSchema>;

const SuggestOrderQuantitiesOutputSchema = z.object({
  suggestedOrderQuantity: z
    .number()
    .describe('La cantidad de pedido sugerida para el producto.'),
  reasoning: z
    .string()
    .describe(
      'El razonamiento detrás de la cantidad de pedido sugerida, incluyendo los factores considerados.'
    ),
});
export type SuggestOrderQuantitiesOutput = z.infer<typeof SuggestOrderQuantitiesOutputSchema>;

export async function suggestOrderQuantities(
  input: SuggestOrderQuantitiesInput
): Promise<SuggestOrderQuantitiesOutput> {
  return suggestOrderQuantitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOrderQuantitiesPrompt',
  input: {schema: SuggestOrderQuantitiesInputSchema},
  output: {schema: SuggestOrderQuantitiesOutputSchema},
  prompt: `Eres un experto gerente de inventario para una tienda veterinaria. Basándote en los datos históricos de ventas, el nivel de stock actual y las tendencias estacionales proporcionadas, sugiere una cantidad de pedido óptima para el producto dado.

  ID del Producto: {{{productId}}}
  Nivel de Stock Actual: {{{currentStockLevel}}}
  Datos Históricos de Ventas (JSON):
  {{#if historicalSalesData}}
  {{trim historicalSalesData}}
  {{else}}
  No se proporcionaron datos históricos de ventas.
  {{/if}}

  Tendencias Estacionales (JSON, Opcional):
  {{#if seasonalTrends}}
  {{trim seasonalTrends}}
  {{else}}
  No se proporcionaron tendencias estacionales.
  {{/if}}

  Considera toda la información disponible para proporcionar una cantidad de pedido sugerida bien razonada. Tu razonamiento debe ser claro y conciso.

  Responde en formato JSON.
  `,
});

const suggestOrderQuantitiesFlow = ai.defineFlow(
  {
    name: 'suggestOrderQuantitiesFlow',
    inputSchema: SuggestOrderQuantitiesInputSchema,
    outputSchema: SuggestOrderQuantitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
