import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createLink } from '@/app/use-cases/create-link'
import { isError } from '@/shared/either'
import { ShortUrlAlreadyExistsError } from '@/app/use-cases/errors/short-url-already-exists'
import { InvalidLinkInputError } from '@/app/use-cases/errors/invalid-link-input'

const createLinkBodySchema = z
    .object({
        originalUrl: z.string().describe('Destination URL to be shortened.'),
        shortUrl: z
            .string()
            .describe('Custom short slug. Allowed pattern: ^[a-z0-9-]+$'),
    })
    .describe('Payload for creating a short link.')
    .meta({
        example: {
            originalUrl: 'https://example.com/articles/fastify-zod',
            shortUrl: 'fastify-zod',
        },
    })

const createLinkSuccessSchema = z
    .object({
        id: z.string().describe('Unique identifier of the created short link.'),
        originalUrl: z.string().describe('Original URL provided in the request.'),
        shortUrl: z.string().describe('Unique short slug.'),
        clicks: z.number().describe('Number of redirects made using this short link.'),
        createdAt: z.date().describe('Creation timestamp.'),
    })
    .describe('Short link created successfully.')
    .meta({
        example: {
            id: '0195f5f6-cf0b-72ce-8df4-7d8d7c6d2f2f',
            originalUrl: 'https://example.com/articles/fastify-zod',
            shortUrl: 'fastify-zod',
            clicks: 0,
            createdAt: '2026-06-11T12:00:00.000Z',
        },
    })

const conflictErrorSchema = z
    .object({
        message: z.string(),
    })
    .describe('The requested shortUrl already exists.')
    .meta({
        example: {
            message: 'This short URL already exists.',
        },
    })

const unprocessableEntitySchema = z
    .object({
        message: z.string(),
        errors: z.array(z.string()),
    })
    .describe('Validation failed in application use case rules.')
    .meta({
        example: {
            message: 'Invalid link input.',
            errors: [
                'originalUrl must be a valid URL.',
                'shortUrl must match ^[a-z0-9-]+$.',
            ],
        },
    })

const badRequestSchema = z
    .object({
        message: z.string(),
    })
    .describe('Request does not match route body contract.')
    .meta({
        example: {
            message: 'Bad request',
        },
    })

const internalServerErrorSchema = z
    .object({
        message: z.string(),
    })
    .describe('Unexpected server error.')
    .meta({
        example: {
            message: 'Internal server error',
        },
    })

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
    server.post(
        '/links',
        {
            schema: {
                summary: 'Create a new short link',
                description:
                    'Creates a short link and validates business constraints for originalUrl and shortUrl.',
                operationId: 'createLink',
                tags: ['Links'],
                consumes: ['application/json'],
                body: createLinkBodySchema,
                response: {
                    201: createLinkSuccessSchema,
                    409: conflictErrorSchema,
                    422: unprocessableEntitySchema,
                    400: badRequestSchema,
                    500: internalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            const result = await createLink(request.body)

            if (isError(result)) {
                if (result.error instanceof ShortUrlAlreadyExistsError) {
                    return reply.status(409).send({
                        message: result.error.message,
                    })
                }

                if (result.error instanceof InvalidLinkInputError) {
                    return reply.status(422).send({
                        message: result.error.message,
                        errors: result.error.messages,
                    })
                }

                throw result.error
            }

            return reply.status(201).send(result.success)
        }
    )
}