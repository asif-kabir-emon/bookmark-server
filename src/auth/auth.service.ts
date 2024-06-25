import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      const hashPassword = await bcrypt.hash(dto.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPassword,
          firstName: dto.firstName || '',
          lastName: dto.lastName || '',
        },
      });

      delete newUser.password;

      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('User already exists with this email');
      }
    }
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const jwtPayload = {
      email: user.email,
      userId: user.id,
    };

    const token = this.jwt.sign(jwtPayload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });

    return { token };
  }
}
