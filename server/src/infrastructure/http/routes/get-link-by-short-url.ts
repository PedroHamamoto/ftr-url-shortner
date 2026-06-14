import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getLinkByShortUrl } from '@/app/use-cases/get-link-by-short-url'
import { isError } from '@/shared/either'
import { LinkNotFoundError } from '@/app/use-cases/errors/link-not-found'
import { linkSchema } from '../schemas/link'
import {
    badRequestSchema,
    internalServerErrorSchema,
    linkNotFoundErrorSchema,
} from '../schemas/error'

const getLinkByShortUrlParamsSchema = z
    .object({
        shortUrl: z.string().describe('Short URL slug to retrieve. Example matrix param: /links;shortUrl=fastify-zod'),
    })
    .describe('Matrix route params for retrieving a short link by shortUrl.')
    .meta({
        example: {
            shortUrl: 'fastify-zod',
        },
    })

export const getLinkByShortUrlRoute: FastifyPluginAsyncZod = async server => {
    server.get(
        '/links;shortUrl=:shortUrl',
        {
            schema: {
                summary: 'Get short link by shortUrl',
                description: 'Retrieves a short link using a matrix parameter in the path segment.',
                operationId: 'getLinkByShortUrl',
                tags: ['Links'],
                params: getLinkByShortUrlParamsSchema,
                response: {
                    200: linkSchema,
                    400: badRequestSchema,
                    404: linkNotFoundErrorSchema
                },
                500: internalServerErrorSchema,
            },
        },
        async (request, reply) => {
            const shortUrl = request.params.shortUrl.trim()

            if (!shortUrl) {
                return reply.status(400).send({
                    message: 'shortUrl not informed.',
                })
            }

            const result = await getLinkByShortUrl({ shortUrl })

            if (isError(result)) {
                if (result.error instanceof LinkNotFoundError) {
                    return reply.status(404).send({
                        message: result.error.message,
                    })
                }

                return reply.status(400).send({
                    message: 'Invalid shortUrl.',
                })
            }

            return reply.status(200).send(result.success)
        }
    )
}