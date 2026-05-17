import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from "typeorm";
import { Producto } from "../../productos/entities/producto.entity.js";

@Entity("categorias")
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  nombre: string;

  @Column("varchar", { unique: true })
  slug: string;

  @Column("text", { nullable: true })
  descripcion: string;

  @Column("varchar", { nullable: true })
  imagen: string;

  @OneToMany(() => Producto, (p) => p.categoria)
  productos: Producto[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
