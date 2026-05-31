export default function PageContainer({ children, style }) {
  return (
    <div
      style={{
        height: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'calc(90px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
