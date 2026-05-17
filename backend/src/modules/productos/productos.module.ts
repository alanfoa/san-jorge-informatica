import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductosController } from "./productos.controller.js";
import { ProductosService } from "./productos.service.js";
import { Producto } from "./entities/producto.entity.js";
import { ProductoImagen } from "./entities/producto-imagen.entity.js";
import { Caracteristica } from "./entities/caracteristica.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ProductoImagen, Caracteristica])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
