import { z } from 'zod'

export const CategoryFormValidator = z.object({
    name: z.string().min(1).max(30),
    billboardId: z.string().min(1),
})

export type CategoryRequest = z.infer< typeof CategoryFormValidator>