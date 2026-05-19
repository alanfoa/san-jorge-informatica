import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  nombre: string;

  @Column("varchar", { unique: true })
  email: string;

  @Column("varchar")
  password: string;

  @Column("varchar", { default: "editor" })
  rol: string;

  @Column("boolean", { default: true })
  activo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
