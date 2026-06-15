import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { incrementLinkClicksById } from '@/app/use-cases/increment-link-clicks-by-id'
import { isError } from '@/shared/either'
import { LinkNotFoundError } from '@/app/use-cases/errors/link-not-found'
import { linkSchema } from '../schemas/link'
import {
    internalServerErrorSchema,
    linkNotFoundErrorSchema,
} from '../schemas/error'

const incrementLinkClicksByIdParamsSchema = z
    .object({
        id: z.string().describe('Unique identifier of the short link.'),
    })
    .describe('Route params for incrementing clicks of a short link by id.')
    .meta({
        example: {
            id: '0195f5f6-cf0b-72ce-8df4-7d8d7c6d2f2f',
        },
    })

export const incrementLinkClicksByIdRoute: FastifyPluginAsyncZod = async server => {
    server.patch(
        '/links/:id/clicks',
        {
            schema: {
                summary: 'Increment short link clicks by id',
                description: 'Atomically increments clicks by 1 and returns the updated short link.',
                operationId: 'incrementLinkClicksById',
                tags: ['Links'],
                params: incrementLinkClicksByIdParamsSchema,
                response: {
                    200: linkSchema,
                    404: linkNotFoundErrorSchema,
                    500: internalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            const result = await incrementLinkClicksById(request.params)

            if (isError(result)) {
                if (result.error instanceof LinkNotFoundError) {
                    return reply.status(404).send({
                        message: result.error.message,
                    })
                }

                throw result.error
            }

            return reply.status(200).send(result.success)
        }
    )
}
