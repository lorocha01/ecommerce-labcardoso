#!/usr/bin/env node
/**
 * Otimiza os vídeos de `media/videos/` para a web e grava em `public/videos/`.
 *
 *   npm run videos            processa apenas vídeos novos ou alterados
 *   npm run videos -- --force reprocessa todos
 *   npm run videos -- --poster convenios=13   escolhe o segundo exato da thumbnail
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
const posterAt = Object.fromEntries(
  process.argv.flatMap((a, i, all) => (a === '--poster' && all[i + 1] ? [all[i + 1].split('=')] : [])).map(([k, v]) => [k, Number(v)]),
)
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
  const fresh = !force && !(id in posterAt) && [mp4, preview, poster].every((f) => existsSync(f) && statSync(f).mtimeMs >= statSync(input).mtimeMs)

  if (!fresh) {
    process.stdout.write(`→ ${file} `)
    const hasAudio = run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', input]).trim() !== ''
    // Vídeo principal: se já está pronto para a web (ex.: reels baixados do Instagram, H.264 até 720p),
    // apenas reorganiza o arquivo (faststart) — recomprimir aumentaria o tamanho e perderia qualidade.
    const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=bit_rate:stream=codec_type,codec_name,width,height,pix_fmt', '-of', 'json', input]))
    const v = probe.streams.find((st) => st.codec_type === 'video') ?? {}
    const a = probe.streams.find((st) => st.codec_type === 'audio')
    const webReady =
      v.codec_name === 'h264' && v.pix_fmt === 'yuv420p' &&
      (v.width > v.height ? v.width <= 1280 : v.width <= 720) &&
      Number(probe.format.bit_rate) <= 2_600_000 && (!a || a.codec_name === 'aac')
    if (webReady) run('ffmpeg', ['-y', '-i', input, '-map', '0:v:0', ...(a ? ['-map', '0:a:0'] : []), '-c', 'copy', '-movflags', '+faststart', mp4])
    else run('ffmpeg', [
      '-y', '-i', input,
      '-vf', "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2:flags=lanczos,fps=30",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-maxrate', '2500k', '-bufsize', '5000k',
      ...(hasAudio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']),
      '-movflags', '+faststart', mp4,
    ])
    process.stdout.write(webReady ? '(sem recompressão) ' : '')
    // Prévia muda do hover
    const start = duration > 8 ? 1 : 0
    run('ffmpeg', [
      '-y', '-ss', String(start), '-i', input, '-t', '4', '-an',
      '-vf', "scale='if(gt(iw,ih),640,360)':-2,fps=24",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', preview,
    ])
    // Thumbnail: segundo escolhido (--poster) ou quadro mais representativo do início
    const at = posterAt[id]
    run('ffmpeg', [
      '-y', '-ss', String(Number.isFinite(at) ? at : Math.min(1, duration / 4)), '-i', input,
      '-vf', `${Number.isFinite(at) ? '' : 'thumbnail=90,'}scale='if(gt(iw,ih),960,540)':-2:flags=lanczos`, '-frames:v', '1',
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
