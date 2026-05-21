import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MercadoPagoController } from "./mercadopago.controller.js";

@Module({
  imports: [ConfigModule],
  controllers: [MercadoPagoController],
})
export class MercadoPagoModule {}
