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
      <HowItWorks />
      <ExamJourney />
      <CompaniesAndInsurances />
      <FaqSection />
      <LocationSection />
    </>
  )
}
