import z from 'zod'

export const messageErrorSchema = z.object({
    message: z.string(),
})

export const messageWithErrorsSchema = z.object({
    message: z.string(),
    errors: z.array(z.string()),
})

export const badRequestSchema = messageErrorSchema
    .describe('Request does not match route contract.')
    .meta({
        example: {
            message: 'Bad request',
        },
    })

export const internalServerErrorSchema = messageErrorSchema
    .describe('Unexpected server error.')
    .meta({
        example: {
            message: 'Internal server error',
        },
    })

export const linkNotFoundErrorSchema = messageErrorSchema
    .describe('The requested link id was not found.')
    .meta({
        example: {
            message: 'Link not found.',
        },
    })
