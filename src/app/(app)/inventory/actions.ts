"use server";

import { suggestOrderQuantities } from '@/ai/flows/suggest-order-quantities';
import type { SuggestOrderQuantitiesInput, SuggestOrderQuantitiesOutput } from '@/ai/flows/suggest-order-quantities';

export async function getSuggestedQuantity(input: SuggestOrderQuantitiesInput): Promise<SuggestOrderQuantitiesOutput> {
  try {
    const result = await suggestOrderQuantities(input);
    return result;
  } catch (error) {
    console.error("Error getting suggestion:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
}
