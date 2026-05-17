import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from "typeorm";
import { Categoria } from "../../categorias/entities/categoria.entity.js";
import { ProductoImagen } from "./producto-imagen.entity.js";
import { Caracteristica } from "./caracteristica.entity.js";

@Entity("productos")
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  nombre: string;

  @Column("text", { nullable: true })
  descripcion: string;

  @Column("decimal", { precision: 10, scale: 2 })
  precio: number;

  @Column("varchar", { nullable: true })
  imagen: string;

  @Column("boolean", { default: true })
  activo: boolean;

  @Column("boolean", { default: false })
  destacado: boolean;

  @Column("int", { default: 0 })
  stock: number;

  @ManyToOne(() => Categoria, (c) => c.productos)
  @JoinColumn({ name: "categoriaId" })
  categoria: Categoria;

  @Column("int", { nullable: true })
  categoriaId: number;

  @OneToMany(() => ProductoImagen, (pi) => pi.producto, { cascade: true })
  imagenes: ProductoImagen[];

  @OneToMany(() => Caracteristica, (c) => c.producto, { cascade: true })
  caracteristicas: Caracteristica[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
