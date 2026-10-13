# Página de vendas (nexo-edu.com/acalma.html): trocas pendentes

Conferidas em 13/10/2026 contra a página publicada: cada trecho de busca aparece **uma única vez**. Pixel, GA4, consentimento, UTMs e checkout ficam intactos. Não reconstruir a página: só substituir.
O `conferir_trocas.py` aplica as 5 trocas numa cópia e confere.

**URLs definitivas, verificadas (HTTP 200, conteúdo final, sem rascunho):**
- Termos: `https://acalma.nexo-edu.com/termos`
- Privacidade: `https://acalma.nexo-edu.com/privacidade`

**Identificação do fornecedor:** por decisão da responsável, **nenhum número de CPF ou CNPJ é publicado** (página de vendas, termos, privacidade ou arquivos públicos). Os demais dados de identificação e suporte já confirmados continuam. Está em aberto, como pendência separada, avaliar uma forma de identificação do fornecedor compatível com essa decisão (Decreto 7.962/2013, art. 2º, I); a conformidade jurídica **não** está resolvida. Estas 5 trocas não dependem disso.

---

### 1. Perto do preço
Buscar:
```html
<p>Sem mensalidade.<br>Sem necessidade de assinar a Nina.</p>
```
Substituir por:
```html
<p>Sem mensalidade.<br>Sem necessidade de assinar a Nina.</p><p class="fine">Use o mesmo e-mail da compra para acessar. Após o primeiro acesso, funciona sem internet por até 30 dias. Conecte-se novamente para confirmar seu acesso e continuar usando offline.</p>
```

### 2. FAQ "Preciso pagar todo mês?"
Buscar:
```html
<p>Não. A oferta do Acalma é de pagamento único, por R$14,90.</p>
```
Substituir por:
```html
<p>Não. A oferta do Acalma é de pagamento único, por R$14,90, sem mensalidade. O acesso vale enquanto o Acalma estiver em operação; se um dia ele for encerrado, avisaremos com pelo menos 90 dias de antecedência e você poderá baixar seus dados.</p>
```

### 3. FAQ nova, logo depois de "Preciso assinar a Nina?"
Buscar:
```html
<details><summary>Preciso assinar a Nina?</summary><p>Não. O Acalma tem acesso próprio. A Nina é outro produto, com contratação opcional e separada.</p></details>
```
Substituir por:
```html
<details><summary>Preciso assinar a Nina?</summary><p>Não. O Acalma tem acesso próprio. A Nina é outro produto, com contratação opcional e separada.</p></details><details><summary>Como eu acesso? Funciona sem internet?</summary><p>Use o mesmo e-mail da compra para acessar. Após o primeiro acesso, funciona sem internet por até 30 dias. Conecte-se novamente para confirmar seu acesso e continuar usando offline.</p></details>
```

### 4. Configuração dos links jurídicos (as páginas de destino já estão publicadas)
Buscar:
```
termsUrl:'',privacyUrl:'https://nexo-edu.com/politica-de-privacidade.html'
```
Substituir por:
```
termsUrl:'https://acalma.nexo-edu.com/termos',privacyUrl:'https://acalma.nexo-edu.com/privacidade'
```

### 5. Rodapé
Buscar:
```html
<a href="https://nexo-edu.com/politica-de-privacidade.html">Privacidade</a>
```
Substituir por:
```html
<a href="https://acalma.nexo-edu.com/privacidade">Privacidade</a>
```
