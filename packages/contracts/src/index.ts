import { z } from "zod";

export const DesignId = z.string().uuid();

export const ExportRequest = z.object({
  designId: DesignId,
  format: z.enum(["SVG", "PDFX1a", "PDFX4", "EPS"]),
  dpi: z.number().int().min(72).max(600).default(300),
  withTrim: z.boolean().default(false),
  spotColors: z.array(z.string()).optional(),
});
export type ExportRequest = z.infer<typeof ExportRequest>;
