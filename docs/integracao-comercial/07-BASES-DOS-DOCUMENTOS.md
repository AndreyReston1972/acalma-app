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

## Retenção das compras: o que se guarda, por quanto tempo e por quê

| Dado | Para quê | Prazo proposto | Contagem |
|---|---|---|---|
| Aviso completo da Hotmart (`acalma_eventos_hotmart.payload`: pode trazer nome, documento, telefone e endereço do comprador) | conferir pagamento, reembolso e contestação; conciliação com a Hotmart | **até 180 dias** | do **último evento** da transação (`ocorrido_em` mais recente) |
| Registro mínimo: transação, produto, situação, datas dos eventos, e-mail da compra | comprovar a compra; atender pedidos e contestações; religar a compra se a conta for recriada (com nova prova do e-mail) | **até 5 anos** | idem |
| Dados do app (combinados, registros, favoritos, aceites) | o serviço | enquanto a conta existir | apagados na exclusão (cascade) |

**O que as fontes sustentam e o que não sustentam:**
- A LGPD (art. 16, I e art. 7º, VI) **permite** conservar dados para cumprir obrigação legal ou exercer direitos em processo. Ela não fixa prazo.
- O CDC, art. 27, dá **5 anos para o consumidor pedir reparação** por fato do serviço. Isso justifica guardar o **mínimo** que comprova a compra por esse período. **Não obriga** a guardar nada, e não justifica guardar o payload inteiro.
- O CTN, arts. 173 e 195, trata da guarda de livros e comprovantes **do contribuinte**. Na venda pela Hotmart, quem emite os documentos fiscais e o que a fornecedora precisa guardar é questão contábil a confirmar. Não usei o CTN como base para reter dados de clientes.
- Os 180 dias do payload são uma **proposta operacional**: uma folga para reembolsos, contestações e conciliação. Não vêm de norma.
- **Pendente antes da 1ª venda:** uma migration de minimização agendada (como o expurgo de 36 meses do `trial_ledger`) que, depois de 180 dias, apaga do payload os dados do comprador e, depois de 5 anos, apaga o registro mínimo. Ela não foi feita nem aplicada nesta rodada, que não a autorizava.

## Pontos que continuam com você

1. **Encarregado: enquadramento não avaliado por completo.** A Resolução CD/ANPD nº 2/2022, art. 3º, I, exclui da dispensa quem faz **tratamento de alto risco**. O art. 4º define alto risco como um critério geral (larga escala, **ou** afetar significativamente direitos) somado a um específico. A Nina trata **dados de crianças** e usa **tecnologia de IA**, ou seja, dois critérios específicos. Falta decidir se há critério geral. O texto do Acalma só descreve o fato: não há encarregado indicado e o canal atende. Ele não afirma que a dispensa se aplica, nem que a indicação é obrigatória. O enquadramento completo depende de avaliar porte, receita (art. 3º, II) e se há tratamento de alto risco na operação da fornecedora como um todo, incluindo a Nina. Essa avaliação não foi feita. **Decisão:** manter assim, ou indicar um encarregado (pode ser você mesma). Não bloqueia a fase A, mas convém decidir antes de abrir as vendas.
2. **CPF no site de vendas.** O Decreto 7.962/2013, art. 2º, I, pede, em local de destaque no site da oferta, o nome **e o número de inscrição no CPF ou CNPJ** do fornecedor. Hoje os documentos publicados não mostram nenhum número. **Decisão antes de abrir as vendas:** publicar o CPF (ou obter um CNPJ) na página de vendas e nos documentos, ou confirmar com assessoria que a identificação no checkout da Hotmart atende. Não coloquei nenhum número.

## Fontes
- Lei 13.709/2018 (LGPD): planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm (arts. 7º, 16, 18 e 41).
- Resolução CD/ANPD nº 2, de 27/01/2022: in.gov.br (DOU) (arts. 2º, 3º, 4º e 11 do anexo).
- Lei 8.078/1990 (CDC): planalto.gov.br/ccivil_03/leis/l8078compilado.htm (arts. 27 e 49).
- Decreto 7.962/2013 (comércio eletrônico): planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm (arts. 2º e 5º).
- Lei 5.172/1966 (CTN): planalto.gov.br/ccivil_03/leis/l5172compilado.htm (arts. 173 e 195).
- Lei 12.965/2014 (Marco Civil): planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm (art. 15).
