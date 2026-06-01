export default function PageContainer({ children, style }) {
  return (
    <div
      style={{
        height: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
