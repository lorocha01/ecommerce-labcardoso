import { Hero } from '@/components/home/Hero'
import {
  CategoriesSection,
  CompaniesAndInsurances,
  Differentials,
  ExamJourney,
  FaqSection,
  FeaturedSection,
  HowItWorks,
  LocationSection,
  TrustStrip,
} from '@/components/home/Sections'
import { VideoShowcase } from '@/components/video/VideoShowcase'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function Home() {
  useDocumentTitle('Exames laboratoriais com praticidade e confiança')
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoriesSection />
      <FeaturedSection />
      <Differentials />
      <VideoShowcase
        placement="home"
        eyebrow="Por dentro do Cardoso"
        title={<>Veja de perto quem <em className="italic text-brand-600">cuida de você.</em></>}
        description="Conheça nossa estrutura, a equipe e o cuidado em cada etapa — do atendimento à coleta. Assista aos vídeos do laboratório."
      />
      <HowItWorks />
      <ExamJourney />
      <CompaniesAndInsurances />
      <FaqSection />
      <LocationSection />
    </>
  )
}
