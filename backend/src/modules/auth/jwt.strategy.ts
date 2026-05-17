import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, activo: true },
    });
    if (!user) throw new UnauthorizedException("Usuario no encontrado o inactivo");
    return { id: user.id, email: user.email, role: user.rol, nombre: user.nombre };
  }
}
