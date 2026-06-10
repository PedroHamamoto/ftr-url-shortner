import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { env } from '@/infrastructure/env'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Validation error',
            errors: error.validation,
        })
    }

    return reply.status(500).send({
        message: 'Internal server error',
    })
})

server.register(fastifyCors, { origin: '*' })
server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'URL Shortener API',
            version: '1.0.0',
        }
    }
})
server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
})

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
    console.log(`Server is running on port ${env.PORT}`)
})