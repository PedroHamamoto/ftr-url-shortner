export class InvalidLinkInputError extends Error {
    constructor(public readonly messages: string[]) {
        super('Invalid link input.')
    }
}