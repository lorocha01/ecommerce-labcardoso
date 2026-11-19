/**
 * Vídeos do laboratório (reels do Instagram @cardoso.laboratorio).
 *
 * COMO ADICIONAR UM VÍDEO
 * 1. Coloque o arquivo original (.mp4/.mov) em `media/videos/` (pasta ignorada pelo git).
 * 2. Rode `npm run videos` — o script gera em `public/videos/`:
 *      <id>.mp4          vídeo otimizado (H.264, até 720×1280, faststart)
 *      <id>-preview.mp4  prévia muda de ~4s para o hover das miniaturas
 *      <id>.webp         thumbnail (poster)
 *    e imprime o trecho pronto (com a duração) para colar abaixo.
 * 3. Ajuste título, descrição, tema e onde o vídeo aparece (`placements`).
 *
 * Onde cada vídeo aparece:
 *  - 'home'    → galeria "Por dentro do Cardoso", logo após "Por que o Cardoso"
 *  - 'journey' → destaque dentro de "Etapas para realizar seus exames" (ideal: coleta/preparo)
 *  - 'about'   → galeria "Estrutura em vídeo" na página Sobre
 * Seções sem vídeos simplesmente não são exibidas.
 */

export type VideoTopic = 'estrutura' | 'coleta' | 'preparo' | 'equipe' | 'empresas' | 'saude'
export type VideoPlacement = 'home' | 'journey' | 'about'

export interface LabVideo {
  id: string
  title: string
  description: string
  topic: VideoTopic
  /** Vídeo otimizado, ex.: /videos/estrutura.mp4 */
  src: string
  /** Thumbnail, ex.: /videos/estrutura.webp */
  poster: string
  /** Prévia muda e curta exibida ao passar o mouse (opcional). */
  preview?: string
  /** Duração em segundos (o script `npm run videos` informa). */
  duration: number
  /** Link do reel original no Instagram (opcional). */
  instagramUrl?: string
  placements: VideoPlacement[]
}

export const VIDEO_TOPICS: Record<VideoTopic, string> = {
  estrutura: 'Estrutura',
  coleta: 'Coleta',
  preparo: 'Preparo',
  equipe: 'Equipe',
  empresas: 'Empresas',
  saude: 'Saúde',
}

export const videos: LabVideo[] = [
  // Exemplo:
  // {
  //   id: 'estrutura',
  //   title: 'Conheça nossa estrutura',
  //   description: 'Um passeio pelas instalações onde seus exames são analisados com cuidado e tecnologia.',
  //   topic: 'estrutura',
  //   src: '/videos/estrutura.mp4',
  //   poster: '/videos/estrutura.webp',
  //   preview: '/videos/estrutura-preview.mp4',
  //   duration: 42,
  //   instagramUrl: 'https://www.instagram.com/reel/XXXXXXXXXXX/',
  //   placements: ['home', 'about'],
  // },
]

export const videosFor = (placement: VideoPlacement) => videos.filter((v) => v.placements.includes(placement))
