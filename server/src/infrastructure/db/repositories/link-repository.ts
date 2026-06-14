import { db } from '@/infrastructure/db'
import { schema } from '@/infrastructure/db/schemas'
import { Link } from '@/types/link'
import { eq } from 'drizzle-orm'

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

export async function findLinkById(id: string): Promise<Link | null> {
    const [selectedLink] = await db
        .select({
            id: schema.links.id,
            originalUrl: schema.links.originalUrl,
            shortUrl: schema.links.shortUrl,
            clicks: schema.links.clicks,
            createdAt: schema.links.createdAt,
        })
        .from(schema.links)
        .where(eq(schema.links.id, id))

    if (!selectedLink) {
        return null
    }

    return {
        id: selectedLink.id as Link['id'],
        originalUrl: selectedLink.originalUrl,
        shortUrl: selectedLink.shortUrl,
        clicks: selectedLink.clicks,
        createdAt: selectedLink.createdAt,
    }
}

export async function deleteLinkById(id: string): Promise<boolean> {
    const deleteResult = await db
        .delete(schema.links)
        .where(eq(schema.links.id, id))
        .execute()

    return deleteResult.count > 0
}