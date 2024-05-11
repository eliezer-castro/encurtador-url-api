import { UserRepository } from '@/repositories/user-repository'
import { InvalidPassword } from './errors/invalidPassword'
import { UserNotExists } from './errors/user-not-exists'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface LoginUseCaseInterface {
  email: string
  password: string
}

export class LoginUseCase {
  // eslint-disable-next-line
  constructor(private userRepository: UserRepository) { }

  async execute({ email, password }: LoginUseCaseInterface) {
    const existingUser = await this.userRepository.findByEmail(email)

    if (!existingUser) {
      throw new UserNotExists()
    }

    const passwordIsValid = bcrypt.compareSync(password, existingUser.password)

    if (!passwordIsValid) {
      throw new InvalidPassword()
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido')
    }

    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    )

    return token
  }
}
