import { z } from 'zod'

export const BillboardsFormValidator = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1)
})

export type BillboardsRequest = z.infer< typeof BillboardsFormValidator>