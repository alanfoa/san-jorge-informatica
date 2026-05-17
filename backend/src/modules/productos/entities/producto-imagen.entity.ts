import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from "typeorm";
import { Producto } from "./producto.entity.js";

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
