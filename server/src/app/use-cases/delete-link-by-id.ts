import { Either, makeError, makeSuccess } from '@/shared/either'
import { Link } from '@/types/link'
import {
    deleteLinkById as deleteLinkByIdRepository,
    findLinkById,
} from '@/infrastructure/db/repositories/link-repository'
import { LinkNotFoundError } from './errors/link-not-found'

type DeleteLinkByIdInput = {
    id: string
}

export async function deleteLinkById(
    input: DeleteLinkByIdInput
): Promise<Either<LinkNotFoundError, Link>> {
    const link = await findLinkById(input.id)

    if (!link) {
        return makeError(new LinkNotFoundError())
    }

    const wasDeleted = await deleteLinkByIdRepository(input.id)

    if (!wasDeleted) {
        return makeError(new LinkNotFoundError())
    }

    return makeSuccess(link)
}
