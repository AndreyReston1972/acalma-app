/* Título de seção — padrão único de hierarquia (uppercase, 700, #6B7280, mb-sm).
   Aceita conteúdo (inclui emojis funcionais) e um `meta` opcional à direita. */
export default function TituloSecao({ children, meta }) {
  return (
    <div className="flex items-center justify-between mb-sm">
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280' }}>
        {children}
      </p>
      {meta && <span style={{ fontSize: 12, color: '#6B7280' }}>{meta}</span>}
    </div>
  )
}
