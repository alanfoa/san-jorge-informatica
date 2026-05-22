import { Controller, Post, UseGuards, Inject } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/guards/roles.decorator.js";
import { AdminService } from "./admin.service.js";

@Controller("admin")
export class AdminController {
  constructor(@Inject(AdminService) private adminService: AdminService) {}

  @Post("sync-invid")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async syncInvid() {
    return this.adminService.syncFromInvid();
  }
}
