import { Controller, Post, Body, BadRequestException, HttpCode } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference } from "mercadopago";

interface ItemDto {
  title: string;
  quantity: number;
  unit_price: number;
}

interface CreatePreferenceDto {
  items: ItemDto[];
  external_reference?: string;
}

@Controller("mercadopago")
export class MercadoPagoController {
  private client: MercadoPagoConfig;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>("MERCADOPAGO_ACCESS_TOKEN");
    if (token) {
      this.client = new MercadoPagoConfig({ accessToken: token });
    }
  }

  @Post("create-preference")
  @HttpCode(200)
  async createPreference(@Body() dto: CreatePreferenceDto) {
    if (!this.client) {
      throw new BadRequestException(
        "Mercado Pago no configurado. Falta MERCADOPAGO_ACCESS_TOKEN en .env"
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException("El carrito está vacío");
    }

    for (const item of dto.items) {
      if (item.unit_price <= 0) {
        throw new BadRequestException(
          `"${item.title}" no tiene precio asignado. Solo productos con precio pueden pagarse con Mercado Pago.`
        );
      }
    }

    const frontendUrl = this.configService.get<string>("CORS_ORIGIN") || "http://localhost:5173";

    const preference = new Preference(this.client);
    const result = await preference.create({
      body: {
        items: dto.items.map((item, i) => ({
          id: String(i + 1),
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${frontendUrl}/productos`,
          failure: `${frontendUrl}/cart`,
          pending: `${frontendUrl}/cart`,
        },
        auto_return: "approved",
        external_reference: dto.external_reference,
      },
    });

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    };
  }
}
