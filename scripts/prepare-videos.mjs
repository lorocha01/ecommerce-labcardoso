#!/usr/bin/env node
/**
 * Otimiza os vídeos de `media/videos/` para a web e grava em `public/videos/`.
 *
 *   npm run videos            processa apenas vídeos novos ou alterados
 *   npm run videos -- --force reprocessa todos
 *
 * Para cada arquivo gera:
 *   <id>.mp4          H.264 + AAC, até 720 px de largura (vertical), faststart (começa a tocar antes de baixar tudo)
 *   <id>-preview.mp4  prévia muda de 4 s em 360 px, usada no hover das miniaturas
 *   <id>.webp         thumbnail 540 px escolhida automaticamente (quadro mais representativo)
 * Requer ffmpeg/ffprobe instalados.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'media', 'videos')
const OUT = join(root, 'public', 'videos')
const force = process.argv.includes('--force')
const EXT = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv'])

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const kb = (f) => `${Math.round(statSync(f).size / 1024)} KB`

try {
  run('ffmpeg', ['-version'])
} catch {
  console.error('ffmpeg não encontrado. Instale-o (ex.: brew install ffmpeg / apt install ffmpeg).')
  process.exit(1)
}

if (!existsSync(SRC)) {
  mkdirSync(SRC, { recursive: true })
  console.log(`Pasta criada: media/videos/ — coloque os vídeos originais nela e rode novamente.`)
  process.exit(0)
}
mkdirSync(OUT, { recursive: true })

const files = readdirSync(SRC).filter((f) => EXT.has(extname(f).toLowerCase()))
if (!files.length) {
  console.log('Nenhum vídeo em media/videos/.')
  process.exit(0)
}

const entries = []
for (const file of files) {
  const input = join(SRC, file)
  const id = slug(basename(file, extname(file)))
  const mp4 = join(OUT, `${id}.mp4`)
  const preview = join(OUT, `${id}-preview.mp4`)
  const poster = join(OUT, `${id}.webp`)
  const duration = Math.round(Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input]).trim()) || 0)
  const fresh = !force && [mp4, preview, poster].every((f) => existsSync(f) && statSync(f).mtimeMs >= statSync(input).mtimeMs)

  if (!fresh) {
    process.stdout.write(`→ ${file} `)
    const hasAudio = run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', input]).trim() !== ''
    // Vídeo principal
    run('ffmpeg', [
      '-y', '-i', input,
      '-vf', "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2:flags=lanczos,fps=30",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-maxrate', '2500k', '-bufsize', '5000k',
      ...(hasAudio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']),
      '-movflags', '+faststart', mp4,
    ])
    // Prévia muda do hover
    const start = duration > 8 ? 1 : 0
    run('ffmpeg', [
      '-y', '-ss', String(start), '-i', input, '-t', '4', '-an',
      '-vf', "scale='if(gt(iw,ih),640,360)':-2,fps=24",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', preview,
    ])
    // Thumbnail: quadro mais representativo dos primeiros segundos
    run('ffmpeg', [
      '-y', '-ss', String(Math.min(1, duration / 4)), '-i', input,
      '-vf', "thumbnail=90,scale='if(gt(iw,ih),960,540)':-2:flags=lanczos", '-frames:v', '1',
      '-c:v', 'libwebp', '-quality', '82', poster,
    ])
    console.log(`✓ ${kb(mp4)} · prévia ${kb(preview)} · thumb ${kb(poster)}`)
  } else {
    console.log(`= ${file} (já otimizado)`)
  }
  entries.push({ id, duration })
}

console.log('\nCole/ajuste em src/data/videos.ts:\n')
for (const { id, duration } of entries) {
  console.log(`  {
    id: '${id}',
    title: '',
    description: '',
    topic: 'estrutura',
    src: '/videos/${id}.mp4',
    poster: '/videos/${id}.webp',
    preview: '/videos/${id}-preview.mp4',
    duration: ${duration},
    instagramUrl: '',
    placements: ['home'],
  },`)
}
