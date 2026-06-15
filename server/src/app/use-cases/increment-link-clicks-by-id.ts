import { Either, makeError, makeSuccess } from '@/shared/either'
import { Link } from '@/types/link'
import { incrementLinkClicksById as incrementLinkClicksByIdRepository } from '@/infrastructure/db/repositories/link-repository'
import { LinkNotFoundError } from './errors/link-not-found'

type IncrementLinkClicksByIdInput = {
    id: string
}

export async function incrementLinkClicksById(
    input: IncrementLinkClicksByIdInput
): Promise<Either<LinkNotFoundError, Link>> {
    const updatedLink = await incrementLinkClicksByIdRepository(input.id)

    if (!updatedLink) {
        return makeError(new LinkNotFoundError())
    }

    return makeSuccess(updatedLink)
}
