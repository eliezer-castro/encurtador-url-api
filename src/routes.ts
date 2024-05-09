import { FastifyInstance } from 'fastify'
import {
  createShortUrl,
  deleteShortUrl,
  getAllShortUrls,
  getShortUrlDetails,
  redirectToOriginalUrl,
  getClickHistory,
} from './controllers/urlController'
import { loginUser, registerUser } from './controllers/authController'
import { authenticate } from './middleware/authMiddleware'
import { UserRepository } from './repositories/UserRepository'
import { UserRepositoryImpl } from './repositories/UserRepositoryImpl'
import { ShortenedUrlRepository } from './repositories/ShortenedUrlRepository'
import { ShortenedUrlRepositoryImpl } from './repositories/ShortenedUrlRepositoryImpl'

export async function appRoutes(app: FastifyInstance) {
  const userRepository: UserRepository = new UserRepositoryImpl()
  const ShortenedUrlRepository: ShortenedUrlRepository =
    new ShortenedUrlRepositoryImpl()
  app.post(
    '/api/v1/shorten-url',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Shorten URL'],
        body: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            customAlias: { type: 'string' },
          },
          required: ['url'],
        },
        security: [{ BearerAuth: [] }],
        response: {
          201: {
            type: 'object',
            properties: {
              shortUrl: { type: 'string', format: 'uri' },
            },
          },
        },
      },
    },
    async (request, reply) =>
      createShortUrl(request, reply, ShortenedUrlRepository, userRepository),
  )

  app.get(
    '/api/v1/:shortCode',
    {
      schema: {
        tags: ['Shorten URL'],
        params: {
          type: 'object',
          properties: {
            shortCode: { type: 'string' },
          },
          required: ['shortCode'],
        },
        response: {
          302: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) =>
      redirectToOriginalUrl(request, reply, ShortenedUrlRepository),
  )

  app.get(
    '/api/v1/user/urls',
    {
      preHandler: authenticate,

      schema: {
        tags: ['Shorten URL'],
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                long_url: { type: 'string' },
                short_url: { type: 'string' },
                clicks: { type: 'integer' },
                created_at: { type: 'string', format: 'date-time' },
                user_id: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) =>
      getAllShortUrls(request, reply, ShortenedUrlRepository, userRepository),
  )

  app.get(
    '/api/v1/url-details',
    {
      preHandler: authenticate,

      schema: {
        tags: ['Shorten URL'],
        querystring: {
          type: 'object',
          properties: {
            urlId: { type: 'string' },
          },
          required: ['shortCode'],
        },
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              long_url: { type: 'string', format: 'uri' },
              short_url: { type: 'string', format: 'uri' },
              clicks: { type: 'integer' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async (request, reply) =>
      getShortUrlDetails(
        request,
        reply,
        ShortenedUrlRepository,
        userRepository,
      ),
  )

  app.delete(
    '/api/v1/delete-url',
    {
      preHandler: authenticate,

      schema: {
        tags: ['Shorten URL'],
        querystring: {
          type: 'object',
          properties: {
            shortUrl: { type: 'string' },
          },
          required: ['shortUrl'],
        },
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) =>
      deleteShortUrl(request, reply, ShortenedUrlRepository, userRepository),
  )

  app.post(
    '/api/v1/register',
    {
      schema: {
        tags: ['Authentication'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['name', 'email', 'password'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => registerUser(request, reply, userRepository),
  )

  app.post(
    '/api/v1/login',
    {
      schema: {
        tags: ['Authentication'],
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => loginUser(request, reply, userRepository),
  )

  app.get(
    '/api/v1/shortCode/:shortCode/clickHistory',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Shorten URL'],
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              totalClicks: {
                type: 'integer',
                description: 'Número total de cliques',
              },

              clickDates: {
                type: 'object',
                description: 'Número de cliques por data',
                additionalProperties: {
                  type: 'integer',
                  description: 'Número de cliques em uma determinada data',
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) =>
      getClickHistory(request, reply, ShortenedUrlRepository),
  )
}