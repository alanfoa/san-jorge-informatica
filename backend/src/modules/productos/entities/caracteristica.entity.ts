import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from "typeorm";
import { Producto } from "./producto.entity.js";

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
