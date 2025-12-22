import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      filiereId: user.filiereId,
    };

    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async validateUser(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersRepository.findById(payload.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Utilisateur non trouvé ou désactivé');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      filiereId: user.filiereId,
    };
  }
}
