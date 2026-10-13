# Bases dos termos e da privacidade (13/10/2026)

Os textos (versão `2026-10-13`, `src/content/documentos.ts`) foram escritos pela NexoEdu com os dados e as decisões que você confirmou. **Não houve revisão jurídica externa**, e os textos não dizem que houve. Abaixo estão as fontes oficiais consultadas, todas textos legais em planalto.gov.br e in.gov.br, lidos em 13/10/2026, e como cada decisão foi aplicada.

## Decisões aplicadas

| Decisão | Texto | Base consultada | Observação |
|---|---|---|---|
| Público inicial: 2 a 6 anos | "Foi pensado para responsáveis por crianças de 2 a 6 anos" | decisão de produto | não coleta idade da criança |
| Pagamento único, sem mensalidade, sem "vitalício" | "Não quer dizer acesso perpétuo: o acesso vale enquanto o Acalma for mantido em operação" | Decreto 7.962/2013, art. 2º, III (características essenciais) | — |
| Encerramento com aviso de 90 dias, acesso mantido e exportação | seção "Disponibilidade e encerramento" | não há prazo legal específico para isso no CDC ou no Decreto 7.962 | apresentado como **política comercial**, "não limita direitos que a lei garanta ao consumidor" |
| Arrependimento em 7 dias | seção "Arrependimento" | CDC, art. 49; Decreto 7.962, art. 5º (informar o meio; pode ser pela mesma ferramenta da compra) | o reembolso é feito pela Hotmart |
| Retenção das compras (**política proposta, não obrigação legal comprovada**) | seção "Por quanto tempo" | ver "Retenção das compras" abaixo | a minimização automática ainda **não está implementada**: é pendência antes da 1ª venda |
| Registros de acesso (Marco Civil, art. 15) | — | obrigação dirigida a provedor "constituído na forma de pessoa jurídica" | a fornecedora é pessoa natural: não foi adotado prazo específico |
| Canal: comercial@nexo-edu.com | "Quem cuida dos seus dados" | LGPD, art. 41, §2º, I; Res. CD/ANPD nº 2/2022, art. 11, §1º (canal obrigatório quando não há encarregado) | — |
| Encarregado | "Não há encarregado de dados formalmente indicado; os pedidos dos titulares são recebidos e respondidos por esse canal" | LGPD, art. 41 (dever de indicar); Res. CD/ANPD nº 2/2022, art. 2º, I (pessoa natural pode ser agente de pequeno porte), art. 11 (dispensa) | **ver o ponto 1 abaixo** |

## Retenção das compras (revisada em 13/10/2026)

**Hoje (publicado, privacidade `2026-10-13b`):** não há exclusão automática. O registro da compra e os avisos da Hotmart ficam guardados. Enquanto a compra der acesso, o registro serve para liberar e recuperar o acesso, inclusive depois da exclusão da conta.

**Proposta, migration `20261013100000_acalma_minimizacao_compras.sql` (NÃO aplicada):**

| Situação | Registro mínimo (transação, produto, situação, datas, e-mail da compra) | Payload completo (dados pessoais do comprador) |
|---|---|---|
| `aprovada`, `em_disputa` (dão acesso) | **nunca apagado automaticamente**, vinculado ou não a uma conta | `aprovada`: resumido 180 dias depois do marco; `em_disputa`: nunca |
| `pendente` | nunca (caso de conciliação) | nunca |
| `cancelada` (nunca paga) | apagado 180 dias depois do marco: só conciliação, sem pagamento a comprovar | resumido em 180 dias |
| `reembolsada`, `chargeback` | apagado **5 anos** depois do marco, para comprovar a devolução e atender reclamações (referência: CDC art. 27, prazo de pretensão do consumidor; política, não obrigação legal comprovada) | resumido em 180 dias |
| transação com evento ainda não aplicado (pausa ou configuração) | nada é tocado | nada é tocado |

- **Situação definitiva** (a única que leva à exclusão): `chargeback`, `reembolsada` (só pode virar `chargeback`) e `cancelada`. **`aprovada` não é definitiva**: ainda pode receber reembolso ou chargeback.
- **Marco:** o momento em que a compra **entrou** na situação atual. É o menor `ocorrido_em` entre os eventos dessa situação; sem data, o menor `recebido_em`. Duplicatas não são gravadas; reenvios ou reprocessamentos com data igual ou posterior e eventos sem data não movem o marco.
- **Exclusão da conta:** os dados do app saem na hora (cascade). A compra fica sem dono (`user_id` nulo), com o e-mail da compra, e continua religável com nova prova do e-mail enquanto der acesso.
- **Testado** (PGlite): compra válida antiga, conta excluída + recuperação, reembolso (marco no reembolso, não na aprovação), disputa, pendente, recompra, duplicata + reenvio + evento sem data, fora de ordem, cancelada, pausa.

## Pontos que continuam com você

1. **Encarregado: enquadramento não avaliado por completo.** A Resolução CD/ANPD nº 2/2022, art. 3º, I, exclui da dispensa quem faz **tratamento de alto risco**. O art. 4º define alto risco como um critério geral (larga escala, **ou** afetar significativamente direitos) somado a um específico. A Nina trata **dados de crianças** e usa **tecnologia de IA**, ou seja, dois critérios específicos. Falta decidir se há critério geral. O texto do Acalma só descreve o fato: não há encarregado indicado e o canal atende. Ele não afirma que a dispensa se aplica, nem que a indicação é obrigatória. O enquadramento completo depende de avaliar porte, receita (art. 3º, II) e se há tratamento de alto risco na operação da fornecedora como um todo, incluindo a Nina. Essa avaliação não foi feita. **Decisão:** manter assim, ou indicar um encarregado (pode ser você mesma). Não bloqueia a fase A, mas convém decidir antes de abrir as vendas.
2. **Identificação do fornecedor no site de vendas.** O Decreto 7.962/2013, art. 2º, I, pede, em local de destaque no site da oferta, o nome **e o número de inscrição no CPF ou CNPJ** do fornecedor. **Decisão da responsável (13/10):** não expor CPF nem CNPJ publicamente (página de vendas, termos, privacidade ou arquivos públicos); os demais dados de identificação e suporte confirmados continuam. **Pendência separada, em aberto:** avaliar uma forma de identificação do fornecedor compatível com essa decisão (por exemplo, se a identificação feita no checkout da Hotmart atende). A conformidade jurídica deste ponto **não** está resolvida.

## Fontes
- Lei 13.709/2018 (LGPD): planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm (arts. 7º, 16, 18 e 41).
- Resolução CD/ANPD nº 2, de 27/01/2022: in.gov.br (DOU) (arts. 2º, 3º, 4º e 11 do anexo).
- Lei 8.078/1990 (CDC): planalto.gov.br/ccivil_03/leis/l8078compilado.htm (arts. 27 e 49).
- Decreto 7.962/2013 (comércio eletrônico): planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm (arts. 2º e 5º).
- Lei 5.172/1966 (CTN): planalto.gov.br/ccivil_03/leis/l5172compilado.htm (arts. 173 e 195).
- Lei 12.965/2014 (Marco Civil): planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm (art. 15).
