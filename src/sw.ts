/// <reference lib="webworker" />
/*
 * Service worker do Acalma.
 *
 * O que fica disponível sem internet: o próprio app (HTML, JS, CSS, fontes,
 * ilustrações e o conteúdo das orientações, que vai dentro do JS). Os dados da
 * pessoa (combinados, salvos, registros) ficam no localStorage, fora daqui.
 *
 * O que NUNCA entra no cache: chamadas à API (Supabase/conta/compra). Respostas
 * autenticadas não são guardadas pelo service worker.
 *
 * Atualização: a versão nova instala, assume na hora (skipWaiting + clients.claim)
 * e vale a partir da próxima navegação. Os dados no aparelho não são tocados.
 * Na primeira ativação, apaga os caches do Acalma anterior (inclusive o
 * "supabase-cache", que guardava respostas da API antiga).
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

self.addEventListener('install', () => {
  void self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys()
      await Promise.all(nomes.filter((n) => !n.startsWith('workbox-precache')).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})
