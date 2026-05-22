import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller.js";
import { AdminService } from "./admin.service.js";
import { Categoria } from "../categorias/entities/categoria.entity.js";
import {
  Producto,
  ProductoImagen,
} from "../productos/entities/producto.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Producto, ProductoImagen])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
