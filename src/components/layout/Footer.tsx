import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Facebook, Instagram, Lock, Mail, MapPin, Phone } from 'lucide-react'
import { useStore } from '@/store'
import { usePublicCategories } from '@/store/hooks'
import { Logo } from '@/components/ui/Logo'
import { PixelSquares } from '@/components/ui/PixelSquares'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { telLink, whatsappLink } from '@/lib/utils'

export function Footer() {
  const s = useStore((st) => st.settings)
  const categories = usePublicCategories()
  const year = new Date().getFullYear()
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#1F0C0D] text-brand-100/80">
      <PixelSquares tone="white" className="absolute -right-6 top-10 h-40 w-40 opacity-[0.04]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="container relative">
        {/* faixa de contato */}
        <div className="grid gap-6 border-b border-white/10 py-12 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="display text-3xl leading-tight text-white sm:text-4xl">
              {s.slogan.replace(/desde \d{4}/i, '').trim()} <em className="text-peach-200">desde {s.since}.</em>
            </p>
            <p className="mt-3 max-w-lg text-[15px] text-brand-100/70">{s.tagline}. Fale com a nossa equipe para tirar dúvidas sobre exames, preparo e convênios.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href={whatsappLink(s.whatsapp, 'Olá! Vim pelo site e gostaria de atendimento.')} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#25D366] px-5 font-semibold text-white transition hover:brightness-110">
              <WhatsAppIcon className="h-5 w-5" /> {s.whatsapp}
            </a>
            <a href={telLink(s.phone)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white/10 px-5 font-semibold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/15">
              <Phone className="h-4 w-4" /> {s.phone}
            </a>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="white" className="h-12" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-brand-100/60">{s.legalName}. Análises clínicas em {s.city}/{s.state} e região.</p>
            <div className="mt-6 flex gap-2">
              {s.social.instagram && (
                <a href={s.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white ring-1 ring-inset ring-white/10 transition hover:bg-brand-600">
                  <Instagram className="h-[18px] w-[18px]" />
                </a>
              )}
              {s.social.facebook && (
                <a href={s.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white ring-1 ring-inset ring-white/10 transition hover:bg-brand-600">
                  <Facebook className="h-[18px] w-[18px]" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Exames</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link to={`/categorias/${c.slug}`} className="transition hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/exames" className="inline-flex items-center gap-1 font-semibold text-peach-200 hover:text-white">
                  Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Institucional</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/sobre', 'Sobre o laboratório'],
                ['/contato', 'Contato'],
                ['/faq', 'Perguntas frequentes'],
                ['/minha-conta', 'Minha conta'],
                ['/pedidos', 'Meus pedidos'],
                ['/favoritos', 'Favoritos'],
                ['/politica-de-privacidade', 'Política de privacidade'],
                ['/termos-de-uso', 'Termos de uso'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Atendimento</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-peach-200" />
                <span>
                  {s.address} – {s.district}
                  <br />
                  {s.city}/{s.state} · CEP {s.cep}
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-peach-200" />
                <span>
                  {s.hours}
                  <br />
                  {s.hoursSaturday}
                  {s.hoursNote && <span className="mt-1 block text-xs text-brand-100/45">{s.hoursNote}</span>}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-peach-200" />
                <a href={`mailto:${s.email}`} className="break-all hover:text-white">
                  {s.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-brand-100/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.legalName}. Loja virtual demonstrativa — nenhum pagamento real é processado.
          </p>
          <Link to="/admin/login" className="inline-flex items-center gap-1.5 hover:text-white">
            <Lock className="h-3.5 w-3.5" /> Painel administrativo
          </Link>
        </div>
      </div>
    </footer>
  )
}
