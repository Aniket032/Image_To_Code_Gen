import { z } from "zod";

export const generateRequestSchema = z.object({
  HtmlWithTailwindcss: z.string(),
  imageUrl: z.string(),
  generatedImageURL: z.string().optional(),
  accuracy: z.number(),
});
