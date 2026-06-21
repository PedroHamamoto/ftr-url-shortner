import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { Either, makeError, makeSuccess } from '@/shared/either'
import { getAllLinksAsStream } from '@/infrastructure/db/repositories/link-repository'
import { uploadFileToStorage } from '@/infrastructure/storage/upload-file-to-storage'
import { ExportLinksError } from './errors/export-links-error'

type ExportLinksOutput = {
    reportUrl: string
}

export async function exportLinks(): Promise<Either<ExportLinksError, ExportLinksOutput>> {
    try {
        const linksStream = await getAllLinksAsStream()

        const csv = stringify({
            delimiter: ',',
            header: true,
            columns: [
                { key: 'originalUrl', header: 'originalUrl' },
                { key: 'shortUrl', header: 'shortUrl' },
                { key: 'clicks', header: 'clicks' },
                { key: 'createdAt', header: 'createdAt' },
            ],
        })

        const uploadToStorageStream = new PassThrough()

        const convertToCsvPipeline = pipeline(
            linksStream,
            csv,
            uploadToStorageStream
        )

        const uploadToStorage = uploadFileToStorage({
            contentType: 'text/csv',
            contentStream: uploadToStorageStream,
            folder: 'exports',
            filename: 'links.csv',
        })

        const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline])

        return makeSuccess({ reportUrl: url })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return makeError(new ExportLinksError(message))
    }
}
