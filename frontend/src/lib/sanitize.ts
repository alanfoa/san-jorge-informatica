const BANNED_WORDS = ['Kelyx', 'Invid Computers']

export function sanitizarNombre(nombre: string): string {
  let res = nombre
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    res = res.replace(regex, '')
  }
  res = res.replace(/\s*\(\d+\)\s*$/, '')
  return res.replace(/\s+/g, ' ').trim()
}

export function sanitizarDescripcion(descripcion: string): string {
  let res = descripcion
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    res = res.replace(regex, '')
  }
  return res
}
