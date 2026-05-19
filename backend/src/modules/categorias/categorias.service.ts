import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Categoria } from "./entities/categoria.entity.js";
import { CreateCategoriaDto } from "./dto/create-categoria.dto.js";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto.js";

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>
  ) {}

  async create(dto: CreateCategoriaDto) {
    const slug = dto.slug || dto.nombre.toLowerCase().replace(/\s+/g, "-");
    const exists = await this.categoriasRepository.findOne({ where: { slug } });
    if (exists) throw new ConflictException("La categoría ya existe");

    const cat = this.categoriasRepository.create({ ...dto, slug });
    return this.categoriasRepository.save(cat);
  }

  findAll() {
    return this.categoriasRepository.find({ order: { nombre: "ASC" } });
  }

  async findOne(id: number) {
    const cat = await this.categoriasRepository.findOne({
      where: { id },
      relations: ["productos"],
    });
    if (!cat) throw new NotFoundException("Categoría no encontrada");
    return cat;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const cat = await this.categoriasRepository.findOne({ where: { id } });
    if (!cat) throw new NotFoundException("Categoría no encontrada");
    await this.categoriasRepository.update(id, dto as any);
    return this.categoriasRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const cat = await this.categoriasRepository.findOne({
      where: { id },
      relations: ["productos"],
    });
    if (!cat) throw new NotFoundException("Categoría no encontrada");
    if (cat.productos?.length > 0) {
      throw new ConflictException(
        "No se puede eliminar una categoría con productos asociados"
      );
    }
    await this.categoriasRepository.remove(cat);
    return { success: true };
  }
}
