import { db } from '@/infrastructure/db'
import { schema } from '@/infrastructure/db/schemas'
import { Link } from '@/types/link'

export type SaveLinkInput = {
    originalUrl: string
    shortUrl: string
}

export async function saveLink(
    input: SaveLinkInput
): Promise<Link | null> {
    const [insertedLink] = await db
        .insert(schema.links)
        .values({
            originalUrl: input.originalUrl,
            shortUrl: input.shortUrl,
        })
        .onConflictDoNothing({
            target: schema.links.shortUrl,
        })
        .returning()

    if (!insertedLink) {
        return null
    }

    return {
        id: insertedLink.id as Link['id'],
        originalUrl: insertedLink.originalUrl,
        shortUrl: insertedLink.shortUrl,
        clicks: insertedLink.clicks,
        createdAt: insertedLink.createdAt,
    }
}