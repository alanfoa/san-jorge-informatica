import { Module } from "@nestjs/common";
import { MercadoPagoController } from "./mercadopago.controller.js";

@Module({
  controllers: [MercadoPagoController],
})
export class MercadoPagoModule {}
