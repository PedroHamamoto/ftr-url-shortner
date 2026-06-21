import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import z from 'zod'
import { env } from '@/infrastructure/env'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
    contentType: z.string(),
    contentStream: z.instanceof(Readable),
    folder: z.string(),
    filename: z.string(),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
    const { contentType, contentStream, folder, filename } =
        uploadFileToStorageInput.parse(input)

    const now = new Date()
    const dateFormat = now.toISOString().slice(0, 10)
    const uniqueFileName = `${folder}/${dateFormat}-${randomUUID()}-${filename}`

    const upload = new Upload({
        client: r2,
        params: {
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: uniqueFileName,
            Body: contentStream,
            ContentType: contentType,
        },
    })

    await upload.done()

    return {
        key: uniqueFileName,
        url: new URL(uniqueFileName, env.CLOUDFLARE_BUCKET_PUBLIC_URL).toString(),
    }
}
