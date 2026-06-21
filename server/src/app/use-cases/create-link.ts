import { Either, makeError, makeSuccess } from '@/shared/either'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists'
import { InvalidLinkInputError } from './errors/invalid-link-input'
import { Link } from '@/types/link'
import { saveLink } from '@/infrastructure/db/repositories/link-repository'
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
        .max(20, { message: 'shortUrl must be at most 20 characters long.' })
        .regex(/^[a-z0-9]+$/, {
            message: 'shortUrl must have only alphanumeric characters.',
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

    const createdLink = await saveLink(parsedInput.data)

    if (!createdLink) {
        return makeError(new ShortUrlAlreadyExistsError())
    }

    return makeSuccess(createdLink)

}