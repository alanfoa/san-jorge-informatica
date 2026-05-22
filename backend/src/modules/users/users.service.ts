import {
  Injectable, ConflictException, NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto) {
    const exists = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("El email ya está registrado");

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      rol: dto.rol || "editor",
    });
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({
      select: ["id", "nombre", "email", "rol", "activo", "created_at"],
    });
  }

  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      select: ["id", "nombre", "email", "rol", "activo", "created_at"],
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Usuario no encontrado");

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }
    if (dto.email && dto.email !== user.email) {
      const exists = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (exists) throw new ConflictException("El email ya está registrado");
    }

    await this.usersRepository.update(id, dto as any);
    return this.usersRepository.findOne({
      where: { id },
      select: ["id", "nombre", "email", "rol", "activo", "created_at"],
    });
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Usuario no encontrado");
    await this.usersRepository.remove(user);
    return { success: true };
  }
}
