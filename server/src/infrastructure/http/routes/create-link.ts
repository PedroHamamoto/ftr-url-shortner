import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createLink } from '@/app/use-cases/create-link'
import { isError } from '@/shared/either'
import { ShortUrlAlreadyExistsError } from '@/app/use-cases/errors/short-url-already-exists'
import { InvalidLinkInputError } from '@/app/use-cases/errors/invalid-link-input'
import { linkSchema } from '../schemas/link'
import {
    badRequestSchema,
    internalServerErrorSchema,
    messageErrorSchema,
    messageWithErrorsSchema,
} from '../schemas/error'

const createLinkBodySchema = z
    .object({
        originalUrl: z.string().describe('Destination URL to be shortened.'),
        shortUrl: z
            .string()
            .describe('Custom short slug for the URL. Must be unique and contain only alphanumeric characters.'),
    })
    .describe('Payload for creating a short link.')
    .meta({
        example: {
            originalUrl: 'https://example.com/articles/fastify-zod',
            shortUrl: 'fastify-zod',
        },
    })

const conflictErrorSchema = messageErrorSchema
    .describe('The requested shortUrl already exists.')
    .meta({
        example: {
            message: 'This short URL already exists.',
        },
    })

const unprocessableEntitySchema = messageWithErrorsSchema
    .describe('Validation failed in application use case rules.')
    .meta({
        example: {
            message: 'Invalid link input.',
            errors: [
                'originalUrl must be a valid URL.',
                'shortUrl must have only alphanumeric characters.',
            ],
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
                    201: linkSchema,
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