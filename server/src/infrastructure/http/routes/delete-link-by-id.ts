import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { deleteLinkById } from '@/app/use-cases/delete-link-by-id'
import { isError } from '@/shared/either'
import { LinkNotFoundError } from '@/app/use-cases/errors/link-not-found'
import {
    internalServerErrorSchema,
    linkNotFoundErrorSchema,
} from '../schemas/error'

const deleteLinkByIdParamsSchema = z
    .object({
        id: z.string().describe('Unique identifier of the short link.'),
    })
    .describe('Route params for deleting a short link by id.')
    .meta({
        example: {
            id: '0195f5f6-cf0b-72ce-8df4-7d8d7c6d2f2f',
        },
    })

export const deleteLinkByIdRoute: FastifyPluginAsyncZod = async server => {
    server.delete(
        '/links/:id',
        {
            schema: {
                summary: 'Delete a short link by id',
                description: 'Deletes a short link by id and returns 404 when not found.',
                operationId: 'deleteLinkById',
                tags: ['Links'],
                params: deleteLinkByIdParamsSchema,
                response: {
                    204: z.null(),
                    404: linkNotFoundErrorSchema,
                    500: internalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            const result = await deleteLinkById(request.params)

            if (isError(result)) {
                if (result.error instanceof LinkNotFoundError) {
                    return reply.status(404).send({
                        message: result.error.message,
                    })
                }

                throw result.error
            }

            return reply.status(204).send(null)
        }
    )
}
