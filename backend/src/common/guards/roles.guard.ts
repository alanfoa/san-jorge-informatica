import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import "reflect-metadata";
import { ROLES_KEY } from "./roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handlerRoles = Reflect.getMetadata(ROLES_KEY, context.getHandler()) as string[] | undefined;
    const classRoles = Reflect.getMetadata(ROLES_KEY, context.getClass()) as string[] | undefined;
    const requiredRoles = handlerRoles ?? classRoles;
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
