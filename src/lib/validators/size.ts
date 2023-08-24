import { z } from 'zod'

export const SizeValidator = z.object({
    name: z.string().min(1).max(30),
    value: z.string().min(1).max(30),
})

export type SizeRequest = z.infer< typeof SizeValidator>