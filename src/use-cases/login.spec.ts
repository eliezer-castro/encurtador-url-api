/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, describe, it, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { InMemoryUserRepository } from '@/repositories/in-memory/in-memory-user-repository'
import { LoginUseCase } from './login'
import dotenv from 'dotenv'
import { InvalidCredentialsErro } from './errors/invalid-credentials-erros'

dotenv.config()

let userRepository: InMemoryUserRepository
let sut: LoginUseCase

describe('Login Use Case', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new LoginUseCase(userRepository)
  })

  it('should be able to login', async () => {
    await userRepository.createUser({
      id: '1',
      name: 'Guilherme Dalastra',
      email: 'ggdalastra@example.com',
      password: bcrypt.hashSync('123456', 8),
      created_at: new Date(),
    })

    const { user } = await sut.execute({
      email: 'ggdalastra@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to login with invalid credentials', async () => {
    await userRepository.createUser({
      id: '1',
      name: 'Guilherme Dalastra',
      email: 'ggdalastra@example.com',
      password: bcrypt.hashSync('123456', 8),
      created_at: new Date(),
    })

    expect(async () => {
      await sut.execute({
        email: 'gdalastra@example.com',
        password: '123123',
      })
    }).rejects.toThrowError(InvalidCredentialsErro)
  })
})
