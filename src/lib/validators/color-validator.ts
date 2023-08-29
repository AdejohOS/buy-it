import { z } from 'zod'

export const ColorValidator = z.object({
    name: z.string().min(1),
    value: z.string().min(4).regex(/^#/, {
        message: 'String must be a valid hex code'
    }),
})

export type ColorRequest = z.infer< typeof ColorValidator>