import z from 'zod'

export const linkSchema = z
    .object({
        id: z.string().describe('Unique identifier of the short link.'),
        originalUrl: z.string().describe('Original URL provided in the request.'),
        shortUrl: z.string().describe('Unique short slug.'),
        clicks: z.number().describe('Number of redirects made using this short link.'),
        createdAt: z.date().describe('Creation timestamp.'),
    })
    .describe('Short link.')
    .meta({
        example: {
            id: '0195f5f6-cf0b-72ce-8df4-7d8d7c6d2f2f',
            originalUrl: 'https://example.com/articles/fastify-zod',
            shortUrl: 'fastify-zod',
            clicks: 0,
            createdAt: '2026-06-11T12:00:00.000Z',
        },
    })
