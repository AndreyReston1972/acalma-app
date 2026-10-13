# Bases dos termos e da privacidade (13/10/2026)

Os textos (versão `2026-10-13`, `src/content/documentos.ts`) foram escritos pela NexoEdu com os dados e as decisões que você confirmou. **Não houve revisão jurídica externa**, e os textos não dizem que houve. Abaixo estão as fontes oficiais consultadas, todas textos legais em planalto.gov.br e in.gov.br, lidos em 13/10/2026, e como cada decisão foi aplicada.

## Decisões aplicadas

| Decisão | Texto | Base consultada | Observação |
|---|---|---|---|
| Público inicial: 2 a 6 anos | "Foi pensado para responsáveis por crianças de 2 a 6 anos" | decisão de produto | não coleta idade da criança |
| Pagamento único, sem mensalidade, sem "vitalício" | "Não quer dizer acesso perpétuo: o acesso vale enquanto o Acalma for mantido em operação" | Decreto 7.962/2013, art. 2º, III (características essenciais) | — |
| Encerramento com aviso de 90 dias, acesso mantido e exportação | seção "Disponibilidade e encerramento" | não há prazo legal específico para isso no CDC ou no Decreto 7.962 | apresentado como **política comercial**, "não limita direitos que a lei garanta ao consumidor" |
| Arrependimento em 7 dias | seção "Arrependimento" | CDC, art. 49; Decreto 7.962, art. 5º (informar o meio; pode ser pela mesma ferramenta da compra) | o reembolso é feito pela Hotmart |
| Retenção das compras: 5 anos do último evento | seção "Por quanto tempo" | CDC, art. 27 (5 anos para reparação por fato do serviço); CTN, arts. 173 e 195, parágrafo único (5 anos e guarda dos comprovantes); LGPD, art. 16, I (conservação para obrigação legal) | separada dos dados do app (que saem com a exclusão). **A exclusão automática após 5 anos ainda não está implementada** (fazer como o expurgo de 36 meses do `trial_ledger`). |
| Registros de acesso (Marco Civil, art. 15) | — | obrigação dirigida a provedor "constituído na forma de pessoa jurídica" | a fornecedora é pessoa natural: não foi adotado prazo específico |
| Canal: comercial@nexo-edu.com | "Quem cuida dos seus dados" | LGPD, art. 41, §2º, I; Res. CD/ANPD nº 2/2022, art. 11, §1º (canal obrigatório quando não há encarregado) | — |
| Encarregado | "Não há encarregado de dados formalmente indicado; os pedidos dos titulares são recebidos e respondidos por esse canal" | LGPD, art. 41 (dever de indicar); Res. CD/ANPD nº 2/2022, art. 2º, I (pessoa natural pode ser agente de pequeno porte), art. 11 (dispensa) | **ver o ponto 1 abaixo** |

## Pontos que continuam com você

1. **Encarregado: a dispensa pode não se aplicar.** A Resolução CD/ANPD nº 2/2022, art. 3º, I, exclui da dispensa quem faz **tratamento de alto risco**. O art. 4º define alto risco como um critério geral (larga escala, **ou** afetar significativamente direitos) somado a um específico. A Nina trata **dados de crianças** e usa **tecnologia de IA**, ou seja, dois critérios específicos. Falta decidir se há critério geral. O texto do Acalma só descreve o fato (não há encarregado indicado; o canal atende). Ele não afirma que a dispensa se aplica. **Decisão:** manter assim, ou indicar um encarregado (pode ser você mesma). Não bloqueia a fase A, mas convém decidir antes de abrir as vendas.
2. **CPF no site de vendas.** O Decreto 7.962/2013, art. 2º, I, pede, em local de destaque no site da oferta, o nome **e o número de inscrição no CPF ou CNPJ** do fornecedor. Hoje os documentos publicados não mostram nenhum número. **Decisão antes de abrir as vendas:** publicar o CPF (ou obter um CNPJ) na página de vendas e nos documentos, ou confirmar com assessoria que a identificação no checkout da Hotmart atende. Não coloquei nenhum número.

## Fontes
- Lei 13.709/2018 (LGPD): planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm (arts. 7º, 16, 18 e 41).
- Resolução CD/ANPD nº 2, de 27/01/2022: in.gov.br (DOU) (arts. 2º, 3º, 4º e 11 do anexo).
- Lei 8.078/1990 (CDC): planalto.gov.br/ccivil_03/leis/l8078compilado.htm (arts. 27 e 49).
- Decreto 7.962/2013 (comércio eletrônico): planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm (arts. 2º e 5º).
- Lei 5.172/1966 (CTN): planalto.gov.br/ccivil_03/leis/l5172compilado.htm (arts. 173 e 195).
- Lei 12.965/2014 (Marco Civil): planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm (art. 15).
