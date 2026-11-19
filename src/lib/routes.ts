/** Página única de compras ("Comprar exames"), opcionalmente filtrada por categoria. */
export const SHOP_PATH = '/exames'

export const shopUrl = (categorySlug?: string, q?: string) => {
  const params = new URLSearchParams()
  if (categorySlug) params.set('categoria', categorySlug)
  if (q) params.set('q', q)
  const qs = params.toString()
  return qs ? `${SHOP_PATH}?${qs}` : SHOP_PATH
}

/** Área de resultados de exames. */
export const RESULTS_PATH = '/resultados'

/** Categoria de check-ups: exibida como "Check-ups e pacotes" e sempre em primeiro lugar na loja. */
export const CHECKUPS_SLUG = 'check-ups'
export const shopCategoryName = (c: { slug: string; name: string }) => (c.slug === CHECKUPS_SLUG ? 'Check-ups e pacotes' : c.name)
export const checkupsFirst = <T extends { slug: string }>(list: T[]) => [...list].sort((a, b) => Number(b.slug === CHECKUPS_SLUG) - Number(a.slug === CHECKUPS_SLUG))
