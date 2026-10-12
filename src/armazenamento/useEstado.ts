import { useSyncExternalStore } from 'react'
import { assinar, lerEstado, type Estado } from './armazenamento'

export function useEstado(): Estado {
  return useSyncExternalStore(assinar, lerEstado, lerEstado)
}
