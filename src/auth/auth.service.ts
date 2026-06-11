import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { isUniqueViolation } from 'src/common/database/postgres-errors';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.usersService.create(dto.email, passwordHash);
      return { id: user.id, email: user.email };
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictException('Email já cadastrado');
      throw err;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email ou senha incorretos');
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Email ou senha incorretos');
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }
}
