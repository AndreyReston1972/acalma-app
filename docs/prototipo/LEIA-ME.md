# Acalma: protótipo da nova experiência

Branch `prototipo/nova-experiencia-2026-10`, a partir de `main@4ce22f8`. **Não é produção.**
`acalma.nexo-edu.com` continua servindo a `main`.

## O que é

Um protótipo navegável de alta fidelidade para avaliação no celular. Ele representa uma
pessoa que **já ativou o acesso**. Esse estado é de demonstração, não um controle de
acesso pronto.

- Sem login, sem pagamento, sem Supabase (a dependência foi removida desta branch).
- Sem chamadas de rede em uso: as fontes vêm no pacote e o conteúdo é estático.
- Sem service worker e sem manifest: o protótipo não instala nada no navegador.
- Fora do contexto `production` do Netlify (preview, branch, local), a página sai com
  `<meta name="robots" content="noindex, nofollow">` (plugin em `vite.config.ts`).

## Conteúdo

Todos os textos estão marcados como `estado: 'rascunho'` em `src/content/`: são
**candidatos à revisão editorial e profissional**, não conteúdo validado.

- `situacoes.ts`: seis situações. "Desligar a tela" é a referência completa; as demais
  são breves e específicas.
- `sequencias.ts`: três sequências do Preparar (exemplos adaptáveis).
- `seguranca.ts`: usa **apenas** a frase de segurança já presente no projeto Nina
  (190 / 192 / CVV 188). Pendente de revisão jurídica e profissional antes de produção.
- Não há personalização por idade, porque o conteúdo não tem variações reais.
- Não há coleta de nome, data de nascimento ou foto da criança.

## Direção visual: "calma que orienta"

| Token | Valor | Uso |
|---|---|---|
| `creme` | #FDF8F3 | fundo principal |
| `bege` / `bege-forte` | #F5EDE0 / #EBDFCC | superfícies secundárias, fundo das ilustrações |
| `linha` | #E4D8C6 | divisórias finas |
| `verde` | #3B6857 | ação principal, identidade |
| `verde-profundo` | #2F5446 | títulos, contraste, frase sugerida |
| `verde-claro` | #E3ECE6 | estado selecionado |
| `coral` | #E8622A | pequenos acentos e anel de foco (nunca texto pequeno) |
| `coral-texto` | #B4441A | coral legível: link de segurança, ação de excluir |
| `texto` / `texto-2` | #2D3D2E / #5A6A5D | leitura / secundário |

- **Tipografia:** Playfair Display (500/600) só em títulos curtos e na marca; DM Sans
  (400–700) na leitura e na interface; corpo de 17 px; frase sugerida em 22 px, sem
  itálico. As fontes são locais (`@fontsource`).
- **Forma:** cartões com raio de 18 px, controles com 14 px, duas sombras (suave e de
  ação). Alvos de toque de 48 px ou mais.
- **Ilustração:** um único sistema vetorial em `src/ilustracoes/Ilustracao.tsx`, em grade
  de 64, com traço de 2,4, duas superfícies e um acento coral. Só objetos (tela, porta,
  cesta, tênis, toalha, banheira, roupa, gaveta, blocos); nenhuma pessoa, foto ou emoji.
- **Movimento:** entrada de 180 ms e leve afundamento ao toque. Com
  `prefers-reduced-motion`, tudo cai para 1 ms. Sem animação contínua.
- **Estilos:** sem reset fora de camada e sem tokens `--spacing-<nome>`, as duas causas
  dos defeitos do diagnóstico de 12/10 (`src/styles/index.css`).

## Persistência

Uma chave própria e versionada: `acalma.prototipo.v1` (`src/armazenamento/`).

- As chaves do app publicado (`acalma_onboarding`, `acalma_perfil`, `acalma_diario_*`,
  `acalma_checklist`, `acalma_banner_dismissed`) **nunca** são lidas, escritas ou apagadas.
  Isso é coberto por teste.
- Dado corrompido ou de versão desconhecida → o app começa vazio, sem quebrar.
- "Apagar dados deste protótipo" (em Conta) remove só a chave própria.

### Transição futura dos dados antigos (não feita nesta rodada)

1. A versão nova, quando for para produção, **não apaga** as chaves `acalma_*`.
2. A migração será uma etapa explícita e única: ler `acalma_diario_*` e oferecer importar
   os registros antigos como "Registros anteriores", sem converter emoções em situações
   por adivinhação.
3. As chaves antigas só são removidas depois de importação confirmada, e com prazo.
4. O perfil antigo (idade, desafio, reação) não é migrado: não tem uso na nova experiência.

## Rodar

```
npm install
npm run dev        # desenvolvimento
npm run build      # tsc + vite build
npm run lint
npm test           # 20 testes: percursos, persistência, conteúdo
```

## O que falta para produção

Conta NexoEdu (Supabase da Nina) com direito de acesso separado; compra Hotmart de
R$14,90 com tratamento de compra antes do cadastro, duplicidade e reembolso; garantir que
comprar Acalma não inicie o trial da Nina (o signup da Nina hoje cria trial por trigger);
offline real do núcleo, com teste, sem cache de respostas autenticadas; migração opcional
dos dados antigos; revisão editorial e profissional dos textos e do apoio de segurança;
termos, privacidade e consentimento; remoção do `noindex` no contexto de produção (já
automática pelo `CONTEXT`).
