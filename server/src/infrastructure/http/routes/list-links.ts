import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { listLinks } from '@/app/use-cases/list-links'
import { internalServerErrorSchema } from '../schemas/error'
import { linkSchema } from '../schemas/link'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const listLinksQuerystringSchema = z
    .object({
        page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
        pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
    })
    .describe('Page-based pagination parameters for listing short links.')
    .meta({
        example: {
            page: 1,
            pageSize: 10,
        },
    })

const paginatedLinksSchema = z
    .object({
        data: z.array(linkSchema),
        pagination: z.object({
            page: z.number().int().min(1),
            pageSize: z.number().int().min(1),
            totalItems: z.number().int().min(0),
            totalPages: z.number().int().min(0),
            hasNext: z.boolean(),
            hasPrevious: z.boolean(),
        }),
        links: z.object({
            self: z.string(),
            first: z.string(),
            previous: z.string().nullable(),
            next: z.string().nullable(),
            last: z.string(),
        }),
    })
    .describe('Paginated list of short links.')
    .meta({
        example: {
            data: [
                {
                    id: '0195f5f6-cf0b-72ce-8df4-7d8d7c6d2f2f',
                    originalUrl: 'https://example.com/articles/fastify-zod',
                    shortUrl: 'fastify-zod',
                    clicks: 0,
                    createdAt: '2026-06-11T12:00:00.000Z',
                },
            ],
            pagination: {
                page: 2,
                pageSize: 10,
                totalItems: 12,
                totalPages: 2,
                hasNext: false,
                hasPrevious: true,
            },
            links: {
                self: '/api/v1/links?page=2&pageSize=10',
                first: '/api/v1/links?page=1&pageSize=10',
                previous: '/api/v1/links?page=1&pageSize=10',
                next: null,
                last: '/api/v1/links?page=2&pageSize=10',
            },
        },
    })

function buildPageLink(pathname: string, page: number, pageSize: number) {
    const searchParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    })

    return `${pathname}?${searchParams.toString()}`
}

export const listLinksRoute: FastifyPluginAsyncZod = async server => {
    server.get(
        '/links',
        {
            schema: {
                summary: 'List short links',
                description: 'Returns short links using page-based pagination.',
                operationId: 'listLinks',
                tags: ['Links'],
                querystring: listLinksQuerystringSchema,
                response: {
                    200: paginatedLinksSchema,
                    500: internalServerErrorSchema,
                },
            },
        },
        async request => {
            const result = await listLinks(request.query)
            const pathname = request.url.split('?')[0] ?? '/api/v1/links'
            const lastPage = Math.max(result.pagination.totalPages, 1)

            return {
                ...result,
                links: {
                    self: buildPageLink(
                        pathname,
                        result.pagination.page,
                        result.pagination.pageSize
                    ),
                    first: buildPageLink(pathname, 1, result.pagination.pageSize),
                    previous: result.pagination.hasPrevious
                        ? buildPageLink(
                            pathname,
                            result.pagination.page - 1,
                            result.pagination.pageSize
                        )
                        : null,
                    next: result.pagination.hasNext
                        ? buildPageLink(
                            pathname,
                            result.pagination.page + 1,
                            result.pagination.pageSize
                        )
                        : null,
                    last: buildPageLink(
                        pathname,
                        lastPage,
                        result.pagination.pageSize
                    ),
                },
            }
        }
    )
}