const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })

function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "hoje, 14:32" · "ontem, 09:10" · "3 de out., 18:05" */
export function dataHoraCurta(d: Date, agora = new Date()): string {
  const ontem = new Date(agora)
  ontem.setDate(agora.getDate() - 1)
  const quando = mesmoDia(d, agora) ? 'hoje' : mesmoDia(d, ontem) ? 'ontem' : dia.format(d)
  return `${quando}, ${hora.format(d)}`
}

const diaAno = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
/** "1 de jun. de 2026" */
export const dataCurta = (d: Date) => diaAno.format(d)
