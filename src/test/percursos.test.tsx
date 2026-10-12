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
  it('chega à orientação em dois toques, com ação, frase e próximo passo', async () => {
    const u = userEvent.setup()
    abrir('/')
    await u.click(screen.getByRole('link', { name: /ajuda na hora da birra/i }))
    await u.click(screen.getByRole('link', { name: /desligar a tela/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Desligar a tela' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Agora' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Você pode dizer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Depois' })).toBeInTheDocument()
    expect(screen.getByText(/a tela acabou agora/i)).toBeInTheDocument()
    // nada de respiração, emoção ou perfil no caminho
    expect(screen.queryByText(/respir[ae] fundo|qual emoção/i)).not.toBeInTheDocument()
  })

  it('a expansão "Se continuar difícil" é opcional e acessível', async () => {
    const u = userEvent.setup()
    abrir('/agora/desligar-tela')
    const botao = screen.getByRole('button', { name: /se continuar difícil/i })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(/guarde o aparelho fora da vista/i)).not.toBeVisible()
    await u.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/guarde o aparelho fora da vista/i)).toBeVisible()
  })
})

describe('favoritos', () => {
  it('salva, aparece em Salvos e no início, e pode ser desmarcado', async () => {
    const u = userEvent.setup()
    const { unmount } = abrir('/agora/ouvir-nao')
    await u.click(screen.getByRole('button', { name: 'Salvar orientação' }))
    expect(screen.getByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Salva em Salvos')
    expect(salvo().favoritos).toHaveLength(1)
    unmount()

    const inicio = abrir('/')
    expect(screen.getByRole('link', { name: /ouvir um “não”/i })).toHaveAttribute('href', '/agora/ouvir-nao')
    inicio.unmount()

    abrir('/salvos')
    await u.click(screen.getByRole('link', { name: /ouvir um “não”/i }))
    await u.click(screen.getByRole('button', { name: 'Remover dos salvos' }))
    expect(salvo().favoritos).toHaveLength(0)
  })

  it('sem favorito, o início não mostra mensagem de vazio', () => {
    abrir('/')
    expect(screen.queryByText(/salva por você/i)).not.toBeInTheDocument()
  })
})

describe('registro opcional', () => {
  it('exige uma resposta, salva com anotação e mostra em Registros', async () => {
    const u = userEvent.setup()
    abrir('/agora/desligar-tela/registrar')
    const salvar = screen.getByRole('button', { name: 'Salvar' })
    expect(salvar).toBeDisabled()
    await u.click(screen.getByRole('radio', { name: 'Um pouco' }))
    await u.type(screen.getByRole('textbox', { name: /anotação/i }), 'Gaveta antes de falar.')
    await u.click(salvar)

    expect(salvo().registros).toEqual([
      expect.objectContaining({ situacaoId: 'desligar-tela', resposta: 'um-pouco', anotacao: 'Gaveta antes de falar.' }),
    ])
    expect(screen.getByRole('tab', { name: /registros/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/um pouco/i)).toBeInTheDocument()
  })

  it('permite sair sem salvar', async () => {
    const u = userEvent.setup()
    abrir('/agora/ir-embora/registrar')
    await u.click(screen.getByRole('radio', { name: 'Ajudou' }))
    await u.click(screen.getByRole('button', { name: 'Sair sem salvar' }))
    expect(localStorage.getItem(CHAVE)).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Ir embora' })).toBeInTheDocument()
  })

  it('exclui só depois de confirmar, e cancelar mantém o registro', async () => {
    const u = userEvent.setup()
    abrir('/agora/banho-roupa/registrar')
    await u.click(screen.getByRole('radio', { name: 'Ainda não tentei' }))
    await u.click(screen.getByRole('button', { name: 'Salvar' }))

    await u.click(screen.getByRole('button', { name: /banho ou troca de roupa/i }))
    await u.click(screen.getByRole('button', { name: /excluir/i }))
    const dialogo = screen.getByRole('dialog', { name: 'Excluir este registro?' })
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await u.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))
    expect(salvo().registros).toHaveLength(1)

    await u.click(screen.getByRole('button', { name: /excluir/i }))
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir registro' }))
    expect(salvo().registros).toHaveLength(0)
    expect(screen.getByText(/só se quiser/i)).toBeInTheDocument()
  })
})

describe('preparar', () => {
  it('mostra um passo por vez, guarda o passo na URL e volta sem perder a sequência', async () => {
    const u = userEvent.setup()
    abrir('/preparar')
    await u.click(screen.getByRole('link', { name: /guardar, calçar, sair/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Guardar' })).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument()

    await u.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Calçar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Passo 2: Calçar' })).toHaveAttribute('aria-current', 'step')

    await u.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Guardar' })).toBeInTheDocument()
  })

  it('abre direto no passo da URL e termina voltando à lista', async () => {
    const u = userEvent.setup()
    abrir('/preparar/banho?passo=3')
    expect(screen.getByRole('heading', { level: 1, name: 'Vestir' })).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Terminar' }))
    expect(screen.getByRole('heading', { level: 1, name: /mostre o que vem depois/i })).toBeInTheDocument()
  })
})
