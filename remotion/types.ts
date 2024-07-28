import { z } from "zod"

export const SubtitleWordType = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number()
});