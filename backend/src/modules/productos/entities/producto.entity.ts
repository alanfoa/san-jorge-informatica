import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from "typeorm";

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

  @ManyToOne("Categoria", "productos")
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

export interface Categoria {
  id: number;
  productos: Producto[];
}

@Entity("producto_imagenes")
export class ProductoImagen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  url: string;

  @Column("int", { default: 0 })
  orden: number;

  @ManyToOne(() => Producto, (p) => p.imagenes)
  @JoinColumn({ name: "productoId" })
  producto: Producto;

  @Column("int")
  productoId: number;
}

@Entity("caracteristicas")
export class Caracteristica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  nombre: string;

  @Column("varchar")
  valor: string;

  @ManyToOne(() => Producto, (p) => p.caracteristicas)
  @JoinColumn({ name: "productoId" })
  producto: Producto;

  @Column("int")
  productoId: number;
}
