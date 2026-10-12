import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { usarEspacoDemonstracao } from '../armazenamento/armazenamento'

// jsdom ainda não implementa <dialog>.showModal/close
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
  }
}
window.scrollTo = () => {}

// Node 25 expõe um localStorage global experimental que encobre o do jsdom
// (sem getItem quando não há --localstorage-file). Os testes usam um Storage
// em memória com a mesma interface.
class ArmazenamentoEmMemoria implements Storage {
  private dados = new Map<string, string>()
  get length() {
    return this.dados.size
  }
  clear() {
    this.dados.clear()
  }
  getItem(k: string) {
    return this.dados.has(k) ? this.dados.get(k)! : null
  }
  key(i: number) {
    return [...this.dados.keys()][i] ?? null
  }
  removeItem(k: string) {
    this.dados.delete(k)
  }
  setItem(k: string, v: string) {
    this.dados.set(k, String(v))
  }
}
if (typeof globalThis.localStorage?.getItem !== 'function') {
  const armazenamento = new ArmazenamentoEmMemoria()
  Object.defineProperty(globalThis, 'localStorage', { value: armazenamento, configurable: true })
  Object.defineProperty(window, 'localStorage', { value: armazenamento, configurable: true })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  usarEspacoDemonstracao()
})
