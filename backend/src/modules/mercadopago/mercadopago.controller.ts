import {
  Controller, Post, Get, Body, BadRequestException,
  InternalServerErrorException, HttpCode,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { CreatePreferenceDto } from "./dto/create-preference.dto.js";

const MP_TITLE_MAX = 256;

@Controller("mercadopago")
export class MercadoPagoController {
  private client: MercadoPagoConfig | null = null;
  private readonly isTestMode: boolean;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>("MERCADOPAGO_ACCESS_TOKEN");
    if (token) {
      this.client = new MercadoPagoConfig({ accessToken: token });
      this.isTestMode = token.startsWith("TEST-");
    } else {
      this.isTestMode = false;
    }
  }

  @Get("status")
  status() {
    return { configured: !!this.client, testMode: this.isTestMode };
  }

  @Post("create-preference")
  @HttpCode(200)
  async createPreference(@Body() dto: CreatePreferenceDto) {
    if (!this.client) {
      throw new BadRequestException(
        "Mercado Pago no configurado. Falta MERCADOPAGO_ACCESS_TOKEN en .env"
      );
    }

    const frontendUrl = (this.config.get<string>("CORS_ORIGIN") || "http://localhost:5173")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");

    const preference = new Preference(this.client);

    const backUrls = {
      success: `${frontendUrl}/pago/resultado`,
      failure: `${frontendUrl}/pago/resultado`,
      pending: `${frontendUrl}/pago/resultado`,
    };

    try {
      const result = await preference.create({
        body: {
          items: dto.items.map((item, i) => ({
            id: String(i + 1),
            title: item.title.slice(0, MP_TITLE_MAX),
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            currency_id: "ARS",
          })),
          back_urls: backUrls,
          ...(frontendUrl.startsWith("https://")
            ? { auto_return: "approved" as const }
            : {}),
          external_reference: dto.external_reference,
          statement_descriptor: "SAN JORGE INF",
        },
      });

      const checkoutUrl = this.isTestMode
        ? (result.sandbox_init_point ?? result.init_point)
        : result.init_point;

      if (!checkoutUrl) {
        throw new InternalServerErrorException(
          "Mercado Pago no devolvió URL de checkout"
        );
      }

      return {
        id: result.id,
        init_point: checkoutUrl,
        test_mode: this.isTestMode,
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) {
        throw err;
      }
      const message = extractMpError(err);
      throw new BadRequestException(message);
    }
  }
}

function extractMpError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message) return e.message;
    const cause = e.cause as Record<string, unknown> | undefined;
    if (cause && typeof cause.message === "string") return cause.message;
    const api = e.apiResponse as { body?: { message?: string } } | undefined;
    if (api?.body?.message) return api.body.message;
  }
  return "Error al crear la preferencia de pago en Mercado Pago";
}
