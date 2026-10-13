import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProvedorAviso } from '../components/Aviso'
import { Rotas } from '../App'
import { CHAVE } from '../armazenamento/armazenamento'

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <ProvedorAviso>
        <Rotas />
      </ProvedorAviso>
    </MemoryRouter>,
  )
}
const salvo = () => JSON.parse(localStorage.getItem(CHAVE) ?? 'null')

describe('ajuda na hora da birra', () => {
  it('chega à primeira orientação em dois toques, sem perguntas antes', async () => {
    const u = userEvent.setup()
    abrir('/')
    await u.click(screen.getByRole('link', { name: /ajuda na hora da birra/i }))
    await u.click(screen.getByRole('link', { name: /desligar a tela/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Desligar a tela' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Agora' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Você pode dizer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Depois' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Para a próxima vez' })).toBeInTheDocument()
    expect(screen.queryByText(/respir[ae] fundo|qual emoção/i)).not.toBeInTheDocument()
  })

  it('abre um caminho adicional e volta sem perder o contexto', async () => {
    const u = userEvent.setup()
    abrir('/agora/ir-embora')
    const caminhos = within(screen.getByRole('region', { name: /se precisar de mais/i })).getAllByRole('link')
    expect(caminhos.map((l) => l.textContent)).toEqual(['Pede para ficar mais', 'Não quer andar', 'Estamos em público'])

    await u.click(screen.getByRole('link', { name: /não quer andar/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Não quer andar' })).toBeInTheDocument()
    expect(screen.getByText('Ir embora')).toBeInTheDocument()
    expect(screen.getByText(/nunca puxe nem levante pelas mãos/i)).toBeInTheDocument()
    // um nível só: nenhum novo caminho aqui
    expect(screen.queryByRole('region', { name: /se precisar de mais/i })).not.toBeInTheDocument()

    await u.click(screen.getAllByRole('link', { name: /voltar à primeira orientação/i })[0])
    expect(screen.getByRole('heading', { level: 1, name: 'Ir embora' })).toBeInTheDocument()
  })

  it('"Eu também perdi a paciência" é entrada secundária: fora da Home, volta à mesma orientação e leva à segurança', async () => {
    const u = userEvent.setup()
    const { unmount } = abrir('/')
    expect(screen.queryByRole('link', { name: /perdi a paciência/i })).not.toBeInTheDocument()
    unmount()
    abrir('/agora/ouvir-nao')
    await u.click(screen.getByRole('link', { name: /eu também perdi a paciência/i }))
    expect(screen.getByRole('heading', { level: 1, name: /eu também perdi a paciência/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alguém pode se machucar/i })).toHaveAttribute('href', '/seguranca')
    await u.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByRole('heading', { level: 1, name: /ouvir um “não”/i })).toBeInTheDocument()
  })

  it('favorita uma variação específica, distinta da orientação base', async () => {
    const u = userEvent.setup()
    const { unmount } = abrir('/agora/desligar-tela/pede-mais-um')
    await u.click(screen.getByRole('button', { name: 'Salvar esta variação' }))
    expect(screen.getByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute('aria-pressed', 'true')
    expect(salvo().favoritos).toEqual([expect.objectContaining({ situacaoId: 'desligar-tela', caminhoId: 'pede-mais-um' })])
    unmount()

    const base = abrir('/agora/desligar-tela')
    expect(screen.getByRole('button', { name: 'Salvar orientação' })).toHaveAttribute('aria-pressed', 'false')
    base.unmount()

    abrir('/salvos?aba=orientacoes')
    const link = screen.getByRole('link', { name: /desligar a tela.*pede “só mais um”/i })
    expect(link).toHaveAttribute('href', '/agora/desligar-tela/pede-mais-um')
  })
})

describe('combinados', () => {
  it('cria de um modelo, adiciona pelo catálogo, reordena, nomeia, salva uma vez só e mostra', async () => {
    const u = userEvent.setup()
    abrir('/preparar')
    await u.click(screen.getByRole('link', { name: /sair de casa/i }))
    // a tela principal do editor não traz o catálogo inteiro
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: /passos, na ordem/i })).getAllByRole('listitem')).toHaveLength(3)

    await u.click(screen.getByRole('button', { name: 'Mover Sair de casa para cima' }))
    await u.click(screen.getByRole('button', { name: 'Adicionar passo' }))
    const catalogo = screen.getByRole('dialog', { name: 'Escolha um passo' })
    expect(within(catalogo).getByRole('button', { name: /calçar os sapatos \(já está no combinado\)/i })).toBeDisabled()
    await u.click(within(catalogo).getByRole('button', { name: 'Adicionar Lavar as mãos' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Adicionado')).toBeInTheDocument()
    await u.type(screen.getByRole('textbox', { name: /nome/i }), 'Escola')

    await u.click(screen.getByRole('button', { name: 'Salvar combinado' }))
    expect(salvo().combinados).toHaveLength(1)
    expect(salvo().combinados[0]).toMatchObject({ nome: 'Escola', modeloId: 'sair-de-casa', passos: ['guardar-brinquedos', 'sair', 'calcar', 'lavar-maos'] })

    expect(screen.getByRole('heading', { level: 1, name: 'Escola' })).toBeInTheDocument()
    await u.click(screen.getByRole('link', { name: /mostrar para a criança/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Guardar os brinquedos' })).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 4')).toBeInTheDocument()
    // no primeiro passo, a saída não se confunde com a ação "Sair de casa"
    expect(screen.getAllByRole('button', { name: 'Fechar combinado' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^sair$/i })).not.toBeInTheDocument()
    for (let i = 0; i < 3; i++) await u.click(screen.getByRole('button', { name: /próximo/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Lavar as mãos' })).toBeInTheDocument()
    expect(screen.getByText('Último passo')).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Terminar' }))
    expect(screen.getByRole('heading', { name: 'Fim do combinado' })).toBeInTheDocument()
    expect(screen.queryByText(/cumpri|conseguiu|parabéns/i)).not.toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Mostrar de novo' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Guardar os brinquedos' })).toBeInTheDocument()
    expect(salvo().registros).toHaveLength(0)
  })

  it('fechar o catálogo sem escolher não perde nome, ordem nem passos', async () => {
    const u = userEvent.setup()
    abrir('/preparar/novo?modelo=encerrar-tela')
    await u.type(screen.getByRole('textbox', { name: /nome/i }), 'Depois do desenho')
    await u.click(screen.getByRole('button', { name: 'Mover Brincar para cima' }))
    await u.click(screen.getByRole('button', { name: 'Adicionar passo' }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar sem escolher' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /nome/i })).toHaveValue('Depois do desenho')
    const rotulos = within(screen.getByRole('region', { name: /passos, na ordem/i }))
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(rotulos[0]).toMatch(/Brincar/)
    expect(rotulos[1]).toMatch(/Guardar o aparelho/)
  })

  it('mudar um modelo pronto não altera combinados já salvos', async () => {
    // Combinado criado com o modelo antigo de "Encerrar a tela" (3 passos), como estaria num aparelho.
    const antigo = { id: 'c-tela-antigo', nome: '', modeloId: 'encerrar-tela', passos: ['guardar-aparelho', 'lavar-maos', 'brincar'], criadoEm: 'x', atualizadoEm: 'x' }
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 2, favoritos: [], registros: [], combinados: [antigo] }))
    const u = userEvent.setup()
    abrir('/preparar/c-tela-antigo')
    expect(screen.getByText('Lavar as mãos')).toBeInTheDocument()
    await u.click(screen.getByRole('link', { name: /editar/i }))
    const rotulos = within(screen.getByRole('region', { name: /passos, na ordem/i })).getAllByRole('listitem').map((li) => li.textContent)
    expect(rotulos).toHaveLength(3)
    expect(salvo().combinados[0].passos).toEqual(antigo.passos)
  })

  it('impede salvar com menos de 2 passos e explica o que falta', async () => {
    const u = userEvent.setup()
    abrir('/preparar/novo')
    const salvar = screen.getByRole('button', { name: 'Salvar combinado' })
    expect(salvar).toBeDisabled()
    expect(screen.getByText(/adicione pelo menos 2 passos/i)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Adicionar passo' }))
    await u.click(screen.getByRole('button', { name: 'Adicionar Vestir a roupa' }))
    expect(screen.getByText(/falta mais 1 passo/i)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Adicionar passo' }))
    await u.click(screen.getByRole('button', { name: 'Adicionar Ler uma história' }))
    expect(salvar).toBeEnabled()
  })

  it('no limite de 5 passos, explica e não abre mais o catálogo', async () => {
    const u = userEvent.setup()
    abrir('/preparar/novo?modelo=hora-do-banho')
    await u.click(screen.getByRole('button', { name: 'Adicionar passo' }))
    await u.click(screen.getByRole('button', { name: 'Adicionar Lavar as mãos' }))
    expect(screen.getByRole('button', { name: 'Adicionar passo' })).toBeDisabled()
    expect(screen.getByText(/até 5 passos/i)).toBeInTheDocument()
  })

  it('edita e exclui com confirmação; persiste ao reabrir', async () => {
    const u = userEvent.setup()
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        versao: 2,
        favoritos: [],
        registros: [],
        combinados: [{ id: 'c-1', nome: '', modeloId: 'encerrar-tela', passos: ['guardar-aparelho', 'brincar'], criadoEm: 'x', atualizadoEm: 'x' }],
      }),
    )
    const { unmount } = abrir('/preparar/c-1')
    expect(screen.getByRole('heading', { level: 1, name: 'Encerrar a tela' })).toBeInTheDocument()
    await u.click(screen.getByRole('link', { name: /editar/i }))
    await u.click(screen.getByRole('button', { name: 'Mover Brincar para cima' }))
    await u.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(salvo().combinados).toHaveLength(1)
    expect(salvo().combinados[0].passos).toEqual(['brincar', 'guardar-aparelho'])
    unmount()

    abrir('/preparar/c-1')
    await u.click(screen.getByRole('button', { name: /excluir combinado/i }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(salvo().combinados).toHaveLength(1)
    await u.click(screen.getByRole('button', { name: /excluir combinado/i }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir combinado' }))
    expect(salvo().combinados).toHaveLength(0)
  })
})

describe('início', () => {
  it('mostra as duas utilidades e, sem dados, nenhum atalho vazio', () => {
    abrir('/')
    expect(screen.getByRole('link', { name: /ajuda na hora da birra/i })).toHaveAttribute('href', '/agora')
    expect(screen.getByRole('link', { name: /montar nosso combinado/i })).toHaveAttribute('href', '/preparar')
    expect(screen.queryByText(/já salvo por você/i)).not.toBeInTheDocument()
  })

  it('com combinado salvo, oferece abrir e mostrar', () => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        versao: 2,
        favoritos: [],
        registros: [],
        combinados: [{ id: 'c-9', nome: 'Escola', modeloId: 'sair-de-casa', passos: ['calcar', 'sair'], criadoEm: 'x', atualizadoEm: 'x' }],
      }),
    )
    abrir('/')
    expect(screen.getByRole('link', { name: /^escola/i })).toHaveAttribute('href', '/preparar/c-9')
    expect(screen.getByRole('link', { name: 'Mostrar Escola' })).toHaveAttribute('href', '/preparar/c-9/mostrar')
  })
})

describe('registro opcional', () => {
  it('a anotação fica recolhida e preserva o texto ao recolher e reabrir', async () => {
    const u = userEvent.setup()
    abrir('/registrar/desligar-tela?caminho=nao-quer-ajuda')
    expect(screen.getByText(/não quer minha ajuda/i)).toBeInTheDocument()
    expect(screen.getByText(/não é sincronizado/i)).toBeInTheDocument()
    const abrirNota = screen.getByRole('button', { name: /adicionar uma anotação/i })
    expect(abrirNota).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByLabelText('Anotação')).not.toBeVisible()

    await u.click(abrirNota)
    await u.type(screen.getByLabelText('Anotação'), 'Fiquei na poltrona.')
    await u.click(screen.getByRole('button', { name: /recolher a anotação/i }))
    expect(screen.getByLabelText('Anotação')).not.toBeVisible()
    await u.click(screen.getByRole('button', { name: /ver a anotação/i }))
    expect(screen.getByLabelText('Anotação')).toHaveValue('Fiquei na poltrona.')

    await u.click(screen.getByRole('radio', { name: 'Ajudou' }))
    await u.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(salvo().registros[0]).toMatchObject({ situacaoId: 'desligar-tela', caminhoId: 'nao-quer-ajuda', resposta: 'ajudou', anotacao: 'Fiquei na poltrona.' })
  })

  it('"O que ajudou por aqui" mostra só o que a pessoa marcou como Ajudou, separado dos salvos', async () => {
    const u = userEvent.setup()
    abrir('/registrar/ir-embora?caminho=quer-ficar-mais')
    await u.click(screen.getByRole('radio', { name: 'Ajudou' }))
    await u.click(screen.getByRole('button', { name: 'Salvar' }))
    await u.click(screen.getByRole('tab', { name: /orientações/i }))
    const ajudou = screen.getByRole('region', { name: /o que ajudou por aqui/i })
    expect(within(ajudou).getByRole('link', { name: /ir embora.*pede para ficar mais/i })).toBeInTheDocument()
    expect(screen.getByText(/nenhuma ainda/i)).toBeInTheDocument()
  })

  it('exclui registro só depois de confirmar', async () => {
    const u = userEvent.setup()
    abrir('/registrar/banho-roupa')
    await u.click(screen.getByRole('radio', { name: 'Ainda não tentei' }))
    await u.click(screen.getByRole('button', { name: 'Salvar' }))
    await u.click(screen.getByRole('button', { name: /banho ou troca de roupa/i }))
    await u.click(screen.getByRole('button', { name: /^excluir$/i }))
    const dialogo = screen.getByRole('dialog', { name: 'Excluir este registro?' })
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await u.click(within(dialogo).getByRole('button', { name: 'Excluir registro' }))
    expect(salvo().registros).toHaveLength(0)
  })
})

describe('segurança', () => {
  it('separa emergência (192, 190) de apoio (188) e não liga nada sozinho', () => {
    abrir('/seguranca')
    const emergencia = screen.getByRole('region', { name: 'Emergência' })
    expect(within(emergencia).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['tel:192', 'tel:190'])
    const apoio = screen.getByRole('region', { name: 'Para conversar' })
    expect(within(apoio).getByRole('link')).toHaveAttribute('href', 'tel:188')
    expect(screen.getByText(/o cvv não é atendimento de emergência/i)).toBeInTheDocument()
  })
})
