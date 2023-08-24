import { z } from 'zod'

export const SettingsFormValidator = z.object({
    name: z.string().min(1).max(30)
})

export type SettingsRequest = z.infer< typeof SettingsFormValidator>