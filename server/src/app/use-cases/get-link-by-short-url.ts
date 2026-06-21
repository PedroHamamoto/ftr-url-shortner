import z from 'zod'
import { Either, makeError, makeSuccess } from '@/shared/either'
import { Link } from '@/types/link'
import { findLinkByShortUrl } from '@/infrastructure/db/repositories/link-repository'
import { InvalidLinkInputError } from './errors/invalid-link-input'
import { LinkNotFoundError } from './errors/link-not-found'

const getLinkByShortUrlInputSchema = z.object({
    shortUrl: z
        .string()
        .min(1, { message: 'shortUrl must not be empty.' })
        .regex(/^[a-z0-9]+$/, {
            message: 'shortUrl must match ^[a-z0-9-]+$.',
        }),
})

type GetLinkByShortUrlInput = z.infer<typeof getLinkByShortUrlInputSchema>

export async function getLinkByShortUrl(
    input: GetLinkByShortUrlInput
): Promise<Either<InvalidLinkInputError | LinkNotFoundError, Link>> {
    const parsedInput = getLinkByShortUrlInputSchema.safeParse(input)

    if (!parsedInput.success) {
        const messages = [
            ...new Set(parsedInput.error.issues.map(issue => issue.message)),
        ]

        return makeError(new InvalidLinkInputError(messages))
    }

    const link = await findLinkByShortUrl(parsedInput.data.shortUrl)

    if (!link) {
        return makeError(new LinkNotFoundError())
    }

    return makeSuccess(link)
}