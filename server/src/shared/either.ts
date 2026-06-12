export type Failure<T> = {
    error: T
    success?: never
}

export type Success<U> = {
    error?: never
    success: U
}

export type Either<T, U> = NonNullable<Failure<T> | Success<U>>

export const isError = <T, U>(e: Either<T, U>): e is Failure<T> => {
    return e.error !== undefined
}

export const isSuccess = <T, U>(e: Either<T, U>): e is Success<U> => {
    return e.success !== undefined
}

export type UnwrapEither = <T, U>(e: Either<T, U>) => NonNullable<T | U>

export const unwrapEither: UnwrapEither = <T, U>({
    error,
    success,
}: Either<T, U>) => {
    if (success !== undefined && error !== undefined) {
        throw new Error(
            `Received both error and success values at runtime when opening an Either\nError: ${JSON.stringify(
                error
            )}\nSuccess: ${JSON.stringify(success)}`
        )
    }

    if (error !== undefined) {
        return error as NonNullable<T>
    }

    if (success !== undefined) {
        return success as NonNullable<U>
    }

    throw new Error(
        'Received no error or success values at runtime when opening Either'
    )
}

export const makeError = <T>(value: T): Failure<T> => ({ error: value })

export const makeSuccess = <U>(value: U): Success<U> => ({ success: value })
