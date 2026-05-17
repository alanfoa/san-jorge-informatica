import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Inject,
} from "@nestjs/common";
import { CategoriasService } from "./categorias.service.js";
import { CreateCategoriaDto } from "./dto/create-categoria.dto.js";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/guards/roles.decorator.js";

@Controller("categorias")
export class CategoriasController {
  constructor(@Inject(CategoriasService) private categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto
  ) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
