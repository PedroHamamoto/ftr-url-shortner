import z from 'zod'
import {
    listLinks as listLinksRepository,
} from '@/infrastructure/db/repositories/link-repository'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const listLinksInputSchema = z.object({
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
})

type ListLinksInput = z.input<typeof listLinksInputSchema>

export async function listLinks(input: ListLinksInput) {
    const parsedInput = listLinksInputSchema.parse(input)
    const initialResult = await listLinksRepository(parsedInput)

    const totalPages = Math.ceil(initialResult.total / parsedInput.pageSize)
    const effectivePage = totalPages > 0
        ? Math.min(parsedInput.page, totalPages)
        : parsedInput.page

    const result = effectivePage === parsedInput.page
        ? initialResult
        : await listLinksRepository({
            ...parsedInput,
            page: effectivePage,
        })
        
    const hasPrevious = effectivePage > 1
    const hasNext = effectivePage < totalPages

    return {
        data: result.links,
        pagination: {
            page: effectivePage,
            pageSize: parsedInput.pageSize,
            totalItems: result.total,
            totalPages,
            hasNext,
            hasPrevious,
        },
    }
}