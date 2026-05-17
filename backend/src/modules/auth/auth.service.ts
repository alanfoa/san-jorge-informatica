import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity.js";
import bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException("Credenciales inválidas");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Credenciales inválidas");
    if (!user.activo) throw new UnauthorizedException("Usuario inactivo");

    const payload = { sub: user.id, email: user.email, role: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.rol },
    };
  }
}
