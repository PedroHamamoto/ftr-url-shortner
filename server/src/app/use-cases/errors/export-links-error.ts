export class ExportLinksError extends Error {
    constructor(message: string = 'Failed to export links') {
        super(message)
    }
}
