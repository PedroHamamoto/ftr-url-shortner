export class ShortUrlAlreadyExistsError extends Error {
    constructor() {
        super(`This short URL already exists.`)
    }
}