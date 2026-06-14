import gifsicle from 'gifsicle-wasm-browser'

export const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB — backend/Vercel limit

// Progressively shrink (resize + lossy compress) until it fits under MAX_FILE_SIZE.
const ATTEMPTS = [
  '-O1 --lossy=40 --resize 480x_',
  '-O1 --lossy=80 --resize 360x_',
  '-O1 --lossy=120 --resize 240x_',
  '-O1 --lossy=160 --resize 180x_',
]

export async function compressGif(file) {
  let current = file
  for (const opts of ATTEMPTS) {
    if (current.size <= MAX_FILE_SIZE) break
    const [output] = await gifsicle.run({
      input: [{ file: current, name: 'in.gif' }],
      command: [`${opts} in.gif -o /out/out.gif`],
    })
    current = new File([output], file.name, { type: 'image/gif' })
  }
  return current
}
