/** Dispara a animação de "voar para o carrinho" a partir de um elemento. */
export function flyToCart(from: HTMLElement | null) {
  if (!from) return
  const rect = from.getBoundingClientRect()
  window.dispatchEvent(new CustomEvent('labcardoso:fly', { detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } }))
}
