import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, ILike } from "typeorm";
import { usePostgres } from "../../database/typeorm.config.js";
import { Producto, ProductoImagen, Caracteristica } from "./entities/producto.entity.js";
import { Categoria } from "../categorias/entities/categoria.entity.js";
import type { RestoreBackupDto } from "./dto/restore-backup.dto.js";
import { CreateProductoDto } from "./dto/create-producto.dto.js";
import { UpdateProductoDto } from "./dto/update-producto.dto.js";

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(ProductoImagen)
    private imagenesRepository: Repository<ProductoImagen>,
    @InjectRepository(Caracteristica)
    private caracteristicasRepository: Repository<Caracteristica>,
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>
  ) {}

  findAll(query?: {
    categoriaId?: number;
    activo?: boolean;
    destacado?: boolean;
    search?: string;
    sku?: string;
  }) {
    const where: any = {};
    if (query?.categoriaId) where.categoriaId = query.categoriaId;
    if (query?.activo !== undefined) where.activo = query.activo;
    if (query?.destacado !== undefined) where.destacado = query.destacado;

    // Lógica para búsqueda por nombre o SKU
    const like = usePostgres() ? ILike : Like;
    if (query?.search) {
      where.nombre = like(`%${query.search}%`);
    } else if (query?.sku) {
      where.sku = like(`%${query.sku}%`);
    }

    return this.productosRepository.find({
      where,
      relations: ["categoria", "imagenes", "caracteristicas"],
      order: { created_at: "DESC" }, // Ordenar por fecha de creación descendente
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
    const prod = this.productosRepository.create({
      ...dto,
      protegido: true,
    } as any);
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

    await this.productosRepository.save({ ...prod, ...dto, protegido: true } as any);
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

  async restoreFromBackup(dto: RestoreBackupDto) {
    type BackupCat = {
      nombre: string;
      slug: string;
      descripcion?: string;
      imagen?: string;
    };
    type BackupProd = {
      nombre: string;
      descripcion?: string;
      sku?: string;
      precio?: number;
      imagen?: string;
      activo?: boolean;
      destacado?: boolean;
      stock?: number;
      categoriaId?: number;
      categoria?: { slug: string };
      imagenes?: { url: string; orden?: number }[];
      caracteristicas?: { nombre: string; valor: string }[];
    };

    const slugToId = new Map<string, number>();

    for (const raw of dto.categorias ?? []) {
      const c = raw as BackupCat;
      let cat = await this.categoriasRepository.findOne({ where: { slug: c.slug } });
      if (!cat) {
        cat = await this.categoriasRepository.save(
          this.categoriasRepository.create({
            nombre: c.nombre,
            slug: c.slug,
            descripcion: c.descripcion ?? "",
            imagen: c.imagen ?? "",
          })
        );
      }
      slugToId.set(c.slug, cat.id);
    }

    let created = 0;
    let updated = 0;

    for (const raw of dto.productos) {
      const p = raw as BackupProd;

      const categoriaId =
        p.categoriaId
        ?? (p.categoria?.slug ? slugToId.get(p.categoria.slug) : undefined);

      let existing = p.sku
        ? await this.productosRepository.findOne({ where: { sku: p.sku } })
        : null;
      if (!existing) {
        existing = await this.productosRepository.findOne({ where: { nombre: p.nombre } });
      }

      const data: Partial<Producto> = {
        nombre: p.nombre,
        descripcion: p.descripcion ?? "",
        sku: p.sku,
        precio: Number(p.precio) || 0,
        imagen: p.imagen ?? "",
        activo: p.activo !== false,
        destacado: !!p.destacado,
        stock: p.stock ?? 0,
        categoriaId: categoriaId ?? undefined,
        protegido: true,
      };

      let saved: Producto;
      if (existing) {
        await this.productosRepository.save({ ...existing, ...data });
        saved = await this.findOne(existing.id);
        updated++;
      } else {
        saved = await this.productosRepository.save(
          this.productosRepository.create(data)
        );
        created++;
      }

      if (p.imagenes?.length) {
        await this.imagenesRepository.delete({ productoId: saved.id });
        for (const img of p.imagenes) {
          await this.imagenesRepository.save(
            this.imagenesRepository.create({
              url: img.url,
              orden: img.orden ?? 0,
              productoId: saved.id,
            })
          );
        }
      }

      if (p.caracteristicas?.length) {
        await this.caracteristicasRepository.delete({ productoId: saved.id });
        for (const ch of p.caracteristicas) {
          if (!ch.nombre || !ch.valor) continue;
          await this.caracteristicasRepository.save(
            this.caracteristicasRepository.create({
              nombre: ch.nombre,
              valor: ch.valor,
              productoId: saved.id,
            })
          );
        }
      }
    }

    return { created, updated, total: dto.productos.length };
  }
}
