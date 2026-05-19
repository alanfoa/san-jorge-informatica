import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from "typeorm";

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

  @OneToMany("Producto", "categoria")
  productos: Producto[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export interface Producto {
  id: number;
  categoria: Categoria;
}
