import type { UUID } from 'node:crypto'

export type Link = {
    id: UUID
    originalUrl: string
    shortUrl: string
    clicks: number
    createdAt: Date
}
