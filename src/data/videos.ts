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
 *  - 'insurance' → destaque dentro do card "Faça exames pelo seu convênio"
 *  - 'about'   → galeria "Estrutura em vídeo" na página Sobre
 * Seções sem vídeos simplesmente não são exibidas.
 */

export type VideoTopic = 'estrutura' | 'coleta' | 'convenios' | 'preparo' | 'equipe' | 'empresas' | 'saude'
export type VideoPlacement = 'home' | 'journey' | 'insurance' | 'about'

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
  convenios: 'Convênios',
  preparo: 'Preparo',
  equipe: 'Equipe',
  empresas: 'Empresas',
  saude: 'Saúde',
}

export const videos: LabVideo[] = [
  {
    id: 'convenios',
    title: 'Atendemos o seu convênio',
    description: 'Unimed Franca, Unimed Norte Paulista, Hapvida e outros convênios — com mais de 50 anos de credibilidade em Pedregulho e região, preços justos e o melhor atendimento.',
    topic: 'convenios',
    src: '/videos/convenios.mp4',
    poster: '/videos/convenios.webp',
    preview: '/videos/convenios-preview.mp4',
    duration: 26,
    placements: ['home', 'insurance', 'about'],
  },
  {
    id: 'coleta-pelo-sus',
    title: 'Coleta pelo SUS nos postos de saúde',
    description: 'A Aline conta como funciona: além dos convênios, também atendemos pelo SUS, com coletas nos postos de saúde às 7h, em dias definidos para cada unidade.',
    topic: 'coleta',
    src: '/videos/coleta-pelo-sus.mp4',
    poster: '/videos/coleta-pelo-sus.webp',
    preview: '/videos/coleta-pelo-sus-preview.mp4',
    duration: 60,
    placements: ['home', 'journey'],
  },
]

export const videosFor = (placement: VideoPlacement) => videos.filter((v) => v.placements.includes(placement))
