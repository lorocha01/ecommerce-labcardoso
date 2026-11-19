import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Database, Download, Globe, HardDrive, Home, Info, MapPin, Phone, RotateCcw, Save, Share2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreSettings } from '@/types'
import { STORAGE_KEY, useStore } from '@/store'
import { useAdminAuth } from '@/store/adminAuth'
import { AdminPageHeader, DemoNotice, Panel } from '@/components/admin/ui'
import { ImageField } from '@/components/admin/ImageField'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { maskCEP, maskPhone } from '@/lib/masks'
import { downloadFile } from '@/lib/utils'

export default function AdminSettings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetDemoData = useStore((s) => s.resetDemoData)
  const actor = useAdminAuth((s) => s.session?.user ?? 'admin')
  const [f, setF] = useState<StoreSettings>(settings)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const dirtyKeys = useMemo(() => (Object.keys(f) as (keyof StoreSettings)[]).filter((k) => JSON.stringify(f[k]) !== JSON.stringify(settings[k])), [f, settings])
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setF((x) => ({ ...x, [k]: v }))

  const save = () => {
    if (!f.storeName.trim()) return toast.error('O nome da loja é obrigatório.')
    const patch = Object.fromEntries(dirtyKeys.map((k) => [k, f[k]])) as Partial<StoreSettings>
    updateSettings(patch, actor)
    toast.success('Configurações salvas', { description: 'As páginas públicas já refletem as alterações.' })
  }

  const usage = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? ''
      return raw.length * 2
    } catch {
      return 0
    }
  }, [settings, dirtyKeys.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AdminPageHeader title="Configurações da loja" description="Informações exibidas nas páginas públicas do e-commerce." />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6 pb-24">
          <Panel title={<span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-600" /> Identidade</span>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome da loja" name="storeName" value={f.storeName} onChange={(e) => set('storeName', e.target.value)} />
              <Input label="Razão social" name="legalName" value={f.legalName} onChange={(e) => set('legalName', e.target.value)} />
              <div className="sm:col-span-2">
                <ImageField value={f.logoUrl} onChange={(v) => set('logoUrl', v || '/brand/logo-cardoso.png')} label="Logotipo (fundos claros)" maxSize={640} />
              </div>
              <div className="sm:col-span-2">
                <ImageField value={f.logoWhiteUrl} onChange={(v) => set('logoWhiteUrl', v || '/brand/logo-cardoso-white.png')} label="Logotipo (fundos escuros)" maxSize={640} />
              </div>
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-brand-600" /> Contato e atendimento</span>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Telefone" name="phone" value={f.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} />
              <Input label="WhatsApp" name="whatsapp" value={f.whatsapp} onChange={(e) => set('whatsapp', maskPhone(e.target.value))} hint="Usado no botão flutuante e nos links de atendimento." />
              <Input wrapClassName="sm:col-span-2" label="E-mail de contato" name="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
              <Input label="Horário (dias úteis)" name="hours" value={f.hours} onChange={(e) => set('hours', e.target.value)} />
              <Input label="Horário (sábado)" name="hoursSaturday" value={f.hoursSaturday} onChange={(e) => set('hoursSaturday', e.target.value)} />
              <Input wrapClassName="sm:col-span-2" label="Observação sobre horários" name="hoursNote" value={f.hoursNote} onChange={(e) => set('hoursNote', e.target.value)} hint="Deixe vazio após confirmar os horários oficiais." />
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" /> Endereço</span>}>
            <div className="grid gap-4 sm:grid-cols-6">
              <Input wrapClassName="sm:col-span-4" label="Logradouro e número" name="address" value={f.address} onChange={(e) => set('address', e.target.value)} />
              <Input wrapClassName="sm:col-span-2" label="Bairro" name="district" value={f.district} onChange={(e) => set('district', e.target.value)} />
              <Input wrapClassName="sm:col-span-3" label="Cidade" name="city" value={f.city} onChange={(e) => set('city', e.target.value)} />
              <Input wrapClassName="sm:col-span-1" label="UF" name="state" value={f.state} maxLength={2} onChange={(e) => set('state', e.target.value.toUpperCase())} />
              <Input wrapClassName="sm:col-span-2" label="CEP" name="cep" value={f.cep} onChange={(e) => set('cep', maskCEP(e.target.value))} />
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><Info className="h-4 w-4 text-brand-600" /> Informações institucionais</span>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Slogan" name="slogan" value={f.slogan} onChange={(e) => set('slogan', e.target.value)} />
              <Input label="Ano de fundação" name="since" type="number" value={f.since} onChange={(e) => set('since', Number(e.target.value) || f.since)} />
              <Input wrapClassName="sm:col-span-2" label="Frase de apoio" name="tagline" value={f.tagline} onChange={(e) => set('tagline', e.target.value)} />
              <Textarea wrapClassName="sm:col-span-2" label="Sobre o laboratório" name="about" rows={4} value={f.about} onChange={(e) => set('about', e.target.value)} />
              <Textarea wrapClassName="sm:col-span-2" label="Missão" name="mission" rows={2} value={f.mission} onChange={(e) => set('mission', e.target.value)} />
              <Input wrapClassName="sm:col-span-2" label="Convênios divulgados" name="insurances" value={f.insurances.join(', ')} onChange={(e) => set('insurances', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} hint="Separe por vírgula." />
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><Share2 className="h-4 w-4 text-brand-600" /> Redes sociais e links</span>}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Instagram" name="instagram" value={f.social.instagram} onChange={(e) => set('social', { ...f.social, instagram: e.target.value })} />
              <Input label="Facebook" name="facebook" value={f.social.facebook} onChange={(e) => set('social', { ...f.social, facebook: e.target.value })} />
              <Input wrapClassName="sm:col-span-2" label="Portal de resultados de exames" name="resultsUrl" value={f.resultsUrl} onChange={(e) => set('resultsUrl', e.target.value)} hint="Endereço aberto pelo botão “Acessar meus resultados”." />
            </div>
          </Panel>

          <Panel title={<span className="inline-flex items-center gap-2"><Home className="h-4 w-4 text-brand-600" /> Mensagens da página inicial</span>}>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3.5">
                <span>
                  <span className="block text-sm font-semibold">Barra de aviso no topo</span>
                  <span className="text-xs text-ink-500">Exibida acima do cabeçalho em todas as páginas.</span>
                </span>
                <Switch checked={f.announcementActive} onChange={(v) => set('announcementActive', v)} label="Exibir barra de aviso" />
              </div>
              <Input label="Texto da barra de aviso" name="announcement" value={f.announcement} onChange={(e) => set('announcement', e.target.value)} />
              <Input label="Título da seção de categorias" name="homeCategoriesTitle" value={f.homeCategoriesTitle} onChange={(e) => set('homeCategoriesTitle', e.target.value)} />
              <Input label="Título da seção de destaques" name="homeFeaturedTitle" value={f.homeFeaturedTitle} onChange={(e) => set('homeFeaturedTitle', e.target.value)} />
              <Input label="Subtítulo da seção de destaques" name="homeFeaturedSubtitle" value={f.homeFeaturedSubtitle} onChange={(e) => set('homeFeaturedSubtitle', e.target.value)} />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={<span className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-brand-600" /> Dados da demonstração</span>} description="Tudo fica salvo no LocalStorage deste navegador.">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-ink-50 p-3.5">
              <HardDrive className="h-5 w-5 text-ink-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{(usage / 1024).toFixed(0)} KB utilizados</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, (usage / (5 * 1024 * 1024)) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-ink-400">Limite típico do navegador: ~5 MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  downloadFile(`labcardoso-dados-${new Date().toISOString().slice(0, 10)}.json`, exportData(), 'application/json')
                  toast.success('Arquivo JSON exportado.')
                }}
              >
                <Download className="h-4 w-4" /> Exportar dados (JSON)
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> Importar dados (JSON)
              </Button>
              <Button variant="danger" className="w-full justify-start" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" /> Restaurar dados de demonstração
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                const text = await file.text()
                const r = importData(text, actor)
                if (!r.ok) return toast.error(r.error)
                setF(useStore.getState().settings)
                toast.success('Dados importados com sucesso', { description: r.data.recovered.length ? `Coleções inválidas restauradas do padrão: ${r.data.recovered.join(', ')}` : 'Todas as coleções foram carregadas.' })
              }}
            />
          </Panel>
          <DemoNotice>
            Sem backend, os dados ficam restritos a este navegador e dispositivo — não há sincronização entre computadores ou administradores. Não armazene dados pessoais ou de saúde reais.
          </DemoNotice>
          <Panel title={<span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-brand-600" /> Preparado para produção</span>}>
            <ul className="space-y-2 text-[13px] text-ink-600">
              <li>• Ações do store centralizadas em <code className="rounded bg-ink-100 px-1">src/store/index.ts</code> — substituíveis por chamadas de API.</li>
              <li>• Dados iniciais editáveis em <code className="rounded bg-ink-100 px-1">src/data/*.ts</code>.</li>
              <li>• Autenticação isolada em <code className="rounded bg-ink-100 px-1">src/store/adminAuth.ts</code>.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {dirtyKeys.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-ink-900 p-3 pl-5 text-white shadow-lift">
            <span className="text-sm">
              {dirtyKeys.length} alteração(ões) não salva(s)
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setF(settings)} className="h-10 rounded-xl px-3 text-sm font-semibold text-white/70 hover:text-white">
                Descartar
              </button>
              <Button size="sm" className="h-10" onClick={save}>
                <Save className="h-4 w-4" /> Salvar alterações
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        danger
        title="Restaurar dados de demonstração"
        confirmText="Restaurar"
        description="Todos os exames, categorias, pedidos, banners, configurações e cadastros voltarão ao estado inicial. Recomendamos exportar os dados antes. Esta ação não pode ser desfeita."
        onConfirm={() => {
          resetDemoData(actor)
          setF(useStore.getState().settings)
          toast.success('Dados de demonstração restaurados.')
        }}
      />
    </>
  )
}
