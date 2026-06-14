import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
    hasZodFastifySchemaValidationErrors,
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from '@/infrastructure/env'
import { createLinkRoute } from './routes/create-link'
import { deleteLinkByIdRoute } from './routes/delete-link-by-id'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Bad request',
            errors: error.validation,
        })
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        error.statusCode === 400
    ) {
        return reply.status(400).send({
            message: 'Bad request',
        })
    }

    return reply.status(500).send({
        message: 'Internal server error',
    })
})

server.register(fastifyCors, { origin: '*' })
server.register(fastifySwagger, {
    transform: jsonSchemaTransform,
    openapi: {
        info: {
            title: 'URL Shortener API',
            version: '1.0.0',
        },
    },
})
server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})
server.register(async api => {
    api.register(createLinkRoute)
    api.register(deleteLinkByIdRoute)
}, {
    prefix: '/api/v1',
})

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
    console.log(`Server is running on port ${env.PORT}`)
})