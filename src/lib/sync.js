import { supabase } from './supabase'

/* ── Sobe os dados do localStorage para o Supabase após login ── */
export async function syncToSupabase(userId) {
  if (!supabase) return

  await Promise.allSettled([
    syncPerfil(userId),
    syncEpisodios(userId),
    syncChecklist(userId),
  ])
}

/* ── Restaura dados do Supabase quando o localStorage está vazio (novo dispositivo) ── */
export async function restoreFromSupabase(userId) {
  if (!supabase) return

  const temDados =
    localStorage.getItem('acalma_perfil') ||
    Object.keys(localStorage).some(k => k.startsWith('acalma_diario_'))

  if (temDados) return  // já tem dados locais, não sobrescreve

  await Promise.allSettled([
    restorePerfil(userId),
    restoreEpisodios(userId),
    restoreChecklist(userId),
  ])
}

/* ── Persiste uma nova entrada do diário em tempo real ── */
export async function persistirEpisodio(userId, dataKey, entrada) {
  if (!supabase || !userId) return

  await supabase.from('episodios').upsert({
    user_id:       userId,
    source_id:     entrada.data,
    data_episodio: dataKey,
    emocao_id:     entrada.emocaoId   ?? null,
    acoes:         entrada.acoes      ?? [],
    antes:         entrada.antes      ?? '',
    reacao:        entrada.reacao     ?? '',
    terminou:      entrada.terminou   ?? '',
    created_at:    entrada.data,
  }, { onConflict: 'user_id,source_id' })
}

// ──────────────────────── internos ────────────────────────

async function syncPerfil(userId) {
  const perfil = JSON.parse(localStorage.getItem('acalma_perfil') || '{}')
  if (!perfil.idade) return

  await supabase.from('profiles').upsert({
    id:      userId,
    idade:   perfil.idade,
    desafio: perfil.desafio,
    reacao:  perfil.reacao,
  })
}

async function syncEpisodios(userId) {
  const chaves = Object.keys(localStorage).filter(k => k.startsWith('acalma_diario_'))

  for (const chave of chaves) {
    const dataKey = chave.replace('acalma_diario_', '')
    const entradas = JSON.parse(localStorage.getItem(chave) || '[]')

    if (!Array.isArray(entradas)) continue

    const rows = entradas.map(e => ({
      user_id:       userId,
      source_id:     e.data ?? null,
      data_episodio: dataKey,
      emocao_id:     e.emocaoId   ?? null,
      acoes:         e.acoes      ?? [],
      antes:         e.antes      ?? '',
      reacao:        e.reacao     ?? '',
      terminou:      e.terminou   ?? '',
      created_at:    e.data,
    }))

    if (rows.length > 0) {
      await supabase.from('episodios')
        .upsert(rows, { onConflict: 'user_id,source_id' })
    }
  }
}

async function syncChecklist(userId) {
  let saved
  try { saved = JSON.parse(localStorage.getItem('acalma_checklist') || '{}') }
  catch { return }

  if (!saved.semana || !Array.isArray(saved.marcados)) return

  await supabase.from('checklist_semanas').upsert({
    user_id:  userId,
    semana:   saved.semana,
    marcados: saved.marcados,
  }, { onConflict: 'user_id,semana' })
}

async function restorePerfil(userId) {
  const { data } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  if (!data) return

  localStorage.setItem('acalma_perfil', JSON.stringify({
    idade: data.idade, desafio: data.desafio, reacao: data.reacao,
  }))
  localStorage.setItem('acalma_onboarding', 'done')
}

async function restoreEpisodios(userId) {
  const { data } = await supabase
    .from('episodios').select('*')
    .eq('user_id', userId)
    .order('data_episodio', { ascending: false })

  if (!data?.length) return

  const agrupado = {}
  data.forEach(e => {
    const key = `acalma_diario_${e.data_episodio}`
    if (!agrupado[key]) agrupado[key] = []
    agrupado[key].push({
      data:      e.created_at,
      emocaoId:  e.emocao_id,
      acoes:     e.acoes    ?? [],
      antes:     e.antes    ?? '',
      reacao:    e.reacao   ?? '',
      terminou:  e.terminou ?? '',
    })
  })

  Object.entries(agrupado).forEach(([key, lista]) => {
    localStorage.setItem(key, JSON.stringify(lista))
  })
}

async function restoreChecklist(userId) {
  const { data } = await supabase
    .from('checklist_semanas').select('*')
    .eq('user_id', userId)
    .order('semana', { ascending: false })
    .limit(1)

  if (!data?.[0]) return

  localStorage.setItem('acalma_checklist', JSON.stringify({
    semana:   data[0].semana,
    marcados: data[0].marcados ?? [],
  }))
}
