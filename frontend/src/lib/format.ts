export function formatPrice(value: number | string): string {
  return Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
