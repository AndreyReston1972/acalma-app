"""Confere e aplica (numa CÓPIA) as trocas propostas para nexo-edu.com/acalma.html.
Uso: python lp_trocas.py <html publicado> <saida conferida>. Não publica nada."""
import sys

TROCAS = [
    (
        "preço: aviso de e-mail e uso offline (logo abaixo de 'Sem necessidade de assinar a Nina.')",
        '<p>Sem mensalidade.<br>Sem necessidade de assinar a Nina.</p>',
        '<p>Sem mensalidade.<br>Sem necessidade de assinar a Nina.</p><p class="fine">Use o mesmo e-mail da compra para acessar. Após o primeiro acesso, funciona sem internet por até 30 dias. Conecte-se novamente para confirmar seu acesso e continuar usando offline.</p>',
    ),
    (
        "FAQ 'Preciso pagar todo mês?': pagamento único depende da manutenção do serviço",
        '<p>Não. A oferta do Acalma é de pagamento único, por R$14,90.</p>',
        '<p>Não. A oferta do Acalma é de pagamento único, por R$14,90, sem mensalidade. O acesso vale enquanto o Acalma estiver em operação; se um dia ele for encerrado, avisaremos com pelo menos 90 dias de antecedência e você poderá baixar seus dados.</p>',
    ),
    (
        "FAQ nova logo depois de 'Preciso assinar a Nina?'",
        '<details><summary>Preciso assinar a Nina?</summary><p>Não. O Acalma tem acesso próprio. A Nina é outro produto, com contratação opcional e separada.</p></details>',
        '<details><summary>Preciso assinar a Nina?</summary><p>Não. O Acalma tem acesso próprio. A Nina é outro produto, com contratação opcional e separada.</p></details><details><summary>Como eu acesso? Funciona sem internet?</summary><p>Use o mesmo e-mail da compra para acessar. Após o primeiro acesso, funciona sem internet por até 30 dias. Conecte-se novamente para confirmar seu acesso e continuar usando offline.</p></details>',
    ),
    (
        "configuração: termos e privacidade DO ACALMA (só depois que o app comercial estiver publicado)",
        "termsUrl:'',privacyUrl:'https://nexo-edu.com/politica-de-privacidade.html'",
        "termsUrl:'https://acalma.nexo-edu.com/termos',privacyUrl:'https://acalma.nexo-edu.com/privacidade'",
    ),
    (
        "rodapé: link de privacidade do Acalma (idem)",
        '<a href="https://nexo-edu.com/politica-de-privacidade.html">Privacidade</a>',
        '<a href="https://acalma.nexo-edu.com/privacidade">Privacidade</a>',
    ),
]

html = open(sys.argv[1], encoding='utf-8').read()
ok = True
for nome, de, para in TROCAS:
    n = html.count(de)
    print(f"[{'ok' if n == 1 else 'ERRO'}] {nome}: trecho encontrado {n}x")
    ok &= n == 1
    html = html.replace(de, para, 1)
for chave in ("fbq(", "gtag(", "consent", "utm_", "ACALMA_CONFIG", "L108001786T"):
    print(f"  preservado: {chave} -> {'sim' if chave in html else 'NAO'}")
open(sys.argv[2], 'w', encoding='utf-8').write(html)
sys.exit(0 if ok else 1)
