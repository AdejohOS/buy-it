import { z } from 'zod'

export const StoreValidator = z.object({
    name: z.string().min(1).max(30)
})

export type StoreRequest = z.infer< typeof StoreValidator>