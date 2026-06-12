import { Either, makeError, makeSuccess } from '@/shared/either'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists'
import { InvalidLinkInputError } from './errors/invalid-link-input'
import { db } from '@/infrastructure/db'
import { schema } from '@/infrastructure/db/schemas'
import { Link } from '@/types/link'
import z from 'zod'

const createLinkInput = z.object({
    originalUrl: z
        .string()
        .min(1, { message: 'originalUrl must not be empty.' })
        .max(255, {
            message: 'originalUrl must be at most 255 characters long.',
        })
        .url({ message: 'originalUrl must be a valid URL.' }),
    shortUrl: z
        .string()
        .min(1, { message: 'shortUrl must not be empty.' })
        .regex(/^[a-z0-9-]+$/, {
            message: 'shortUrl must match ^[a-z0-9-]+$.',
        }),
})

type CreateLinkInput = z.infer<typeof createLinkInput>

export async function createLink(
    input: CreateLinkInput
): Promise<Either<ShortUrlAlreadyExistsError | InvalidLinkInputError, Link>> {
    const parsedInput = createLinkInput.safeParse(input)

    if (!parsedInput.success) {
        const messages = [
            ...new Set(parsedInput.error.issues.map(issue => issue.message)),
        ]

        return makeError(new InvalidLinkInputError(messages))
    }

    const [insertedLink] = await db
        .insert(schema.links)
        .values({
            originalUrl: parsedInput.data.originalUrl,
            shortUrl: parsedInput.data.shortUrl,
        })
        .onConflictDoNothing({
            target: schema.links.shortUrl,
        })
        .returning()

    if (!insertedLink) {
        return makeError(new ShortUrlAlreadyExistsError())
    }

    const link: Link = {
        id: insertedLink.id as Link['id'],
        originalUrl: insertedLink.originalUrl,
        shortUrl: insertedLink.shortUrl,
        clicks: insertedLink.clicks,
        createdAt: insertedLink.createdAt,
    }

    return makeSuccess(link)

}