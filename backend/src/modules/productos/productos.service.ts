import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Producto } from "./entities/producto.entity.js";
import { CreateProductoDto } from "./dto/create-producto.dto.js";
import { UpdateProductoDto } from "./dto/update-producto.dto.js";

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>
  ) {}

  findAll(query?: {
    categoriaId?: number;
    activo?: boolean;
    destacado?: boolean;
    search?: string;
  }) {
    const where: any = {};
    if (query?.categoriaId) where.categoriaId = query.categoriaId;
    if (query?.activo !== undefined) where.activo = query.activo;
    if (query?.destacado !== undefined) where.destacado = query.destacado;
    if (query?.search) where.nombre = Like(`%${query.search}%`);

    return this.productosRepository.find({
      where,
      relations: ["categoria", "imagenes", "caracteristicas"],
      order: { created_at: "DESC" },
    });
  }

  async findOne(id: number) {
    const prod = await this.productosRepository.findOne({
      where: { id },
      relations: ["categoria", "imagenes", "caracteristicas"],
    });
    if (!prod) throw new NotFoundException("Producto no encontrado");
    return prod;
  }

  async create(dto: CreateProductoDto) {
    const prod = this.productosRepository.create(dto as any);
    return this.productosRepository.save(prod);
  }

  async update(id: number, dto: UpdateProductoDto) {
    const prod = await this.productosRepository.findOne({ where: { id } });
    if (!prod) throw new NotFoundException("Producto no encontrado");

    if (dto.imagenes) {
      await this.productosRepository
        .createQueryBuilder()
        .delete()
        .from("producto_imagenes")
        .where("productoId = :id", { id })
        .execute();
    }
    if (dto.caracteristicas) {
      await this.productosRepository
        .createQueryBuilder()
        .delete()
        .from("caracteristicas")
        .where("productoId = :id", { id })
        .execute();
    }

    await this.productosRepository.save({ ...prod, ...dto } as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const prod = await this.productosRepository.findOne({ where: { id } });
    if (!prod) throw new NotFoundException("Producto no encontrado");

    await this.productosRepository
      .createQueryBuilder()
      .delete()
      .from("producto_imagenes")
      .where("productoId = :id", { id })
      .execute();
    await this.productosRepository
      .createQueryBuilder()
      .delete()
      .from("caracteristicas")
      .where("productoId = :id", { id })
      .execute();
    await this.productosRepository.remove(prod);
    return { success: true };
  }
}
