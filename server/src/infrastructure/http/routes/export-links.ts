import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { exportLinks } from '@/app/use-cases/export-links'
import { isError } from '@/shared/either'
import { ExportLinksError } from '@/app/use-cases/errors/export-links-error'
import { internalServerErrorSchema } from '../schemas/error'

const exportLinksResponseSchema = z
    .object({
        reportUrl: z.string().url().describe('URL to download the exported CSV report.'),
    })
    .describe('Links export report.')
    .meta({
        example: {
            reportUrl: 'https://example.com/exports/20260617-b685c708-d19c-434e-b389-5dc85e8ed6b6-links.csv',
        },
    })

export const exportLinksRoute: FastifyPluginAsyncZod = async server => {
    server.post(
        '/links/export',
        {
            schema: {
                summary: 'Export all links as CSV',
                description: 'Exports all short links to a CSV file and uploads it to storage.',
                operationId: 'exportLinks',
                tags: ['Links'],
                response: {
                    200: exportLinksResponseSchema,
                    500: internalServerErrorSchema,
                },
            },
        },
        async (_request, reply) => {
            const result = await exportLinks()

            if (isError(result)) {
                if (result.error instanceof ExportLinksError) {
                    return reply.status(500).send({
                        message: result.error.message,
                    })
                }

                throw result.error
            }

            return reply.status(200).send(result.success)
        }
    )
}
