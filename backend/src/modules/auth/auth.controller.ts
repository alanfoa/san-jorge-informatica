import { Controller, Get, Post, Body, Inject, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post("login")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get("perfil")
  @UseGuards(JwtAuthGuard)
  perfil(@CurrentUser() user: { id: number; email: string; role: string; nombre: string }) {
    return user;
  }
}
