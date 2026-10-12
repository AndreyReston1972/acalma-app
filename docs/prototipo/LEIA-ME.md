# Acalma: protótipo da nova experiência (v2)

Branch `prototipo/nova-experiencia-2026-10`, PR em rascunho #1 (**não fazer merge**).
Preview: `https://deploy-preview-1--acalma-nexoedu.netlify.app/`.
A v1 parou no commit `0d7bd93`. `acalma.nexo-edu.com` continua servindo a `main`.

## O que é

Protótipo navegável de alta fidelidade para avaliação no celular. Representa uma pessoa
que **já ativou o acesso**: esse estado é de demonstração, não um controle de acesso.

- Sem login, sem pagamento, sem Supabase, sem IA, sem service worker e sem manifest.
- `noindex` fora do contexto `production` do Netlify (`vite.config.ts`) e
  `X-Robots-Tag: noindex` que o Netlify aplica aos Deploy Previews.
- Testes: automatizados (Vitest) e no navegador com emulação. Teclado Android real,
  TalkBack e o S25 físico ainda **não** foram testados.

## Refinamento (commit `f969d2e`, sem novas funcionalidades)

- **Home:** card de ajuda mais baixo, com a cena "ajuda" (tablet, tênis, toalhas) no lugar
  dos balões de conversa; "Montar nosso combinado" inteiro na primeira tela a 360, 390 e
  412 px; "Já salvo por você" aparece só quando há dado.
- **Editor:** a tela principal tem nome, sequência e salvar. O catálogo abre sob demanda
  numa folha inferior (`<dialog>`): Esc, o X ou o fundo fecham sem perder nada; escolher
  devolve à sequência com o passo marcado como "Adicionado". No limite de 5, o botão é
  desabilitado com explicação. Altura do editor com o modelo "Sair de casa" a 360 px:
  1.642 px → 780 px.
- **Mostrar:** uma barra de progresso discreta + "Passo n de N"; Voltar e Próximo sempre
  na mesma posição; "Fechar combinado" separado (não se confunde com "Sair de casa").
- **Texto:** "Pede só mais um" não impõe quando a tela volta: a frase é "Agora não tem
  mais um. A tela acabou." e a orientação permite completar com o próximo momento, se já
  estiver combinado.

## O percurso que a v2 demonstra

"Escolhi a situação → encontrei ajuda → montei nosso combinado → deixei salvo para usar
novamente."

1. **Agora:** situação → primeira orientação em 2 toques (ação, frase, próximo passo).
   Depois, 2 ou 3 caminhos opcionais e específicos ("Ainda está difícil", "Pede só mais
   um", "Não quer andar"...). É um nível só, com retorno à primeira orientação.
2. **Preparar:** combinados visuais personalizados. A pessoa parte de um modelo ou do
   zero, escolhe de 2 a 5 passos de um catálogo de 10 ações, reordena com botões "Mover
   para cima/baixo", dá um nome opcional e salva. Depois mostra à criança um passo por vez,
   com fim em "Fim do combinado", e pode editar ou excluir.
3. **Salvos:** Combinados, Orientações (salvas, incluindo a variação escolhida, e "O que
   ajudou por aqui", só a partir de registros marcados "Ajudou") e Registros.

## Conteúdo

Tudo em `src/content/`, separado dos componentes, com IDs estáveis e marcado como
`estado: 'rascunho'`: **candidato à revisão editorial e profissional, não validado.**
O texto integral está em `CONTEUDO-completo.html` no pacote de avaliação.

Correções editoriais aplicadas na v2:
- Retirada a orientação "segure a mão com firmeza", sem substituir por outra contenção.
- "Mantenha o não" → "Se o não continua valendo...", com o caminho "Quero rever o não".
- "Foi difícil sair" → "Está difícil ir embora" (a saída ainda não aconteceu).
- "Ir embora" não aponta mais para a rotina doméstica "Sair de casa".
- Sem promessas de resultado, culpa ou generalizações; sem conselho médico.

Sem fonte profissional: os textos foram escritos para o protótipo e precisam de revisão.

## Segurança (`src/content/seguranca.ts`)

Papéis conferidos em fontes oficiais em 12/10/2026:
- **192, SAMU** (Ministério da Saúde, gov.br/saude/pt-br/composicao/saes/samu-192):
  urgência de saúde; gratuito, 24 horas.
- **190, Polícia Militar** (Governo do Paraná, "Acionar emergência policial - 190"):
  violência, crime em andamento, risco à integridade; gratuito em todo o país, 24 horas.
- **188, CVV** (cvv.org.br): apoio emocional e prevenção do suicídio; gratuito, 24 horas,
  também por chat. A tela informa que **não é atendimento de emergência**.

A frase "Se for mais do que uma birra" foi trocada por "Você não precisa ter certeza de que
é grave para pedir ajuda." Os testes nunca acionam os links `tel:`.
**Pendente:** revisão jurídica e profissional antes de produção.

## Direção visual

Mantidos: creme #FDF8F3, verde #3B6857, verde profundo #2F5446, bege #F5EDE0, coral
#E8622A em detalhes, Playfair Display em títulos curtos e DM Sans no resto.

Dois sistemas separados:
- **A. Ícones de interface** (`src/ilustracoes/icones.tsx`): grade 24, traço 2.
- **B. Cenas de conteúdo** (`src/ilustracoes/Cena.tsx`): grade 160×120, desenhadas como
  cenas de objetos (blocos caindo na cesta, tênis junto à porta, aparelho entrando na
  caixa, banheira com patinho...). Gramática comum: sombra no chão, face lateral um tom
  abaixo para dar volume, traço de 3 e um único detalhe coral. Sem pessoas, crianças,
  emojis, fotos ou texto. São vetores feitos à mão em código, sem ferramenta de geração
  de imagem.

Composição: Home com a ação dominante ocupando o espaço útil e a cena como protagonista;
estados de selecionado (borda + fundo verde-claro + check), pressionado (afunda 1,5% e
escurece), salvo (marcador coral + aviso) e concluído ("Fim do combinado").
Movimento: entrada de 180 ms e toque; com `prefers-reduced-motion`, 1 ms.

## Persistência

- Chave atual: `acalma.prototipo.v2` (favoritos com `caminhoId`, registros com
  `caminhoId`, combinados).
- **Migração v1 → v2:** se a v2 não existe e há `acalma.prototipo.v1`, favoritos e
  registros são convertidos (`caminhoId: null`) e gravados na v2. A v1 **fica intacta**
  (permite voltar ao preview anterior). "Apagar dados deste protótipo" remove as duas.
- Combinado: `salvar` faz upsert pelo id fixado ao abrir o editor; toques repetidos não
  duplicam.
- As chaves do app publicado (`acalma_*`) **nunca** são lidas, escritas ou apagadas
  (coberto por teste).

### Transição futura dos dados antigos (não feita)

1. A versão de produção não apaga as chaves `acalma_*`.
2. Importação explícita e única: oferecer trazer `acalma_diario_*` como "Registros
   anteriores", sem converter emoções em situações por adivinhação.
3. Remoção das chaves antigas só depois de importação confirmada e com prazo.

## Peso

| | v1 (`0d7bd93`) | v2 |
|---|---|---|
| JS | 278,9 kB (86,5 kB gzip) | 308,4 kB (93,4 kB gzip) |
| CSS | 25,0 kB (5,8 kB gzip) | 28,2 kB (6,3 kB gzip) |
| Imagens raster | 0 | 0 (cenas em SVG no próprio JS) |
| Fontes | 4 woff2 DM Sans + 2 Playfair | igual |

## Rodar

```
npm install
npm run dev
npm run build      # tsc + vite build
npm run lint
npm test           # 36 testes: percursos, persistência/migração, conteúdo
```

## O que falta para produção

Conta NexoEdu (Supabase da Nina) com direito de acesso separado; compra Hotmart de R$14,90
(compra antes do cadastro, duplicidade, reembolso); garantir que a compra do Acalma não
inicie o trial da Nina (**pendente de confirmação na função atual de produção**: a
evidência de que o cadastro da Nina cria trial automaticamente veio das migrations);
offline real do núcleo, implementado e testado, sem cache de respostas autenticadas;
importação opcional dos dados antigos; revisão editorial e profissional dos textos e da
tela de segurança; termos, privacidade e consentimento; teste no S25 físico, com teclado
Android real e TalkBack.
