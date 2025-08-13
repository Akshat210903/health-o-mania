import { z } from 'zod';

export const ScanFoodInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanFoodInput = z.infer<typeof ScanFoodInputSchema>;

export const ScanFoodOutputSchema = z.object({
  foodName: z.string().describe("The name of the food."),
  calories: z.number().describe("The number of calories in the food. This can be a decimal value."),
  macros: z.object({
    protein: z.number().describe("The amount of protein in grams. This can be a decimal value."),
    carb: z.number().describe("The amount of carbohydrates in grams. This can be a decimal value."),
    fat: z.number().describe("The amount of fat in grams. This can be a decimal value."),
  }).describe("The macronutrient breakdown of the food."),
  geminiRaw: z.string().describe("The raw response from the Gemini API."),
});
export type ScanFoodOutput = z.infer<typeof ScanFoodOutputSchema>;
