import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  Query, UseGuards, Inject,
} from "@nestjs/common";
import { ProductosService } from "./productos.service.js";
import { CreateProductoDto } from "./dto/create-producto.dto.js";
import { UpdateProductoDto } from "./dto/update-producto.dto.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/guards/roles.decorator.js";

@Controller("productos")
export class ProductosController {
  constructor(@Inject(ProductosService) private productosService: ProductosService) {}

  @Get()
  findAll(
    @Query("categoriaId") categoriaId?: string,
    @Query("activo") activo?: string,
    @Query("destacado") destacado?: string,
    @Query("search") search?: string,
    @Query("sku") sku?: string // Añadir el parámetro sku
  ) {
    return this.productosService.findAll({
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      activo: activo !== undefined ? activo === "true" : undefined,
      destacado: destacado !== undefined ? destacado === "true" : undefined,
      search,
      sku, // Pasar el parámetro sku al servicio
    });
  }

  @Get("activos")
  findActivos() {
    return this.productosService.findAll({ activo: true });
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "editor")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto
  ) {
    return this.productosService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
