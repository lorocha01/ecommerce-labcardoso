import {
  Activity,
  Baby,
  Beaker,
  Bone,
  Brain,
  ClipboardCheck,
  Dna,
  Droplet,
  FlaskConical,
  Gauge,
  HeartPulse,
  Microscope,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Syringe,
  TestTube,
  TestTubes,
  type LucideIcon,
} from 'lucide-react'

/** Biblioteca de ícones disponível para categorias e exames (editável no painel). */
export const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  droplet: { icon: Droplet, label: 'Gota' },
  activity: { icon: Activity, label: 'Atividade' },
  flask: { icon: FlaskConical, label: 'Frasco' },
  beaker: { icon: Beaker, label: 'Béquer' },
  sun: { icon: Sun, label: 'Sol' },
  heart: { icon: HeartPulse, label: 'Coração' },
  gauge: { icon: Gauge, label: 'Medidor' },
  clipboard: { icon: ClipboardCheck, label: 'Prancheta' },
  microscope: { icon: Microscope, label: 'Microscópio' },
  testtube: { icon: TestTube, label: 'Tubo' },
  testtubes: { icon: TestTubes, label: 'Tubos' },
  dna: { icon: Dna, label: 'DNA' },
  syringe: { icon: Syringe, label: 'Seringa' },
  pill: { icon: Pill, label: 'Cápsula' },
  stethoscope: { icon: Stethoscope, label: 'Estetoscópio' },
  shield: { icon: ShieldCheck, label: 'Escudo' },
  baby: { icon: Baby, label: 'Bebê' },
  bone: { icon: Bone, label: 'Osso' },
  brain: { icon: Brain, label: 'Cérebro' },
  sparkles: { icon: Sparkles, label: 'Brilho' },
}

export function DynamicIcon({ name, className, strokeWidth = 1.75 }: { name: string; className?: string; strokeWidth?: number }) {
  const Cmp = ICONS[name]?.icon ?? TestTube
  return <Cmp className={className} strokeWidth={strokeWidth} />
}
