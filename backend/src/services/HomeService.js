const HomeRepository = require('../repositories/HomeRepository')
const { uploadBuffer } = require('../utils/cloudinary')

function sanitizeSections(sections) {
  if (!Array.isArray(sections)) return []
  return sections
    .map(s => ({
      title:   (s?.title   || '').trim(),
      content: (s?.content || '').trim(),
    }))
    .filter(s => s.title)
}

const EMPTY = { id: 'home', banner_image_url: '', sections: [], updated_at: null }

const HomeService = {
  async get() {
    const existing = await HomeRepository.get()
    return existing || EMPTY
  },

  async update(body) {
    const existing = await HomeRepository.get()
    const data = {
      id:               'home',
      banner_image_url: existing?.banner_image_url || '',
      sections:         sanitizeSections(body.sections),
      updated_at:       new Date().toISOString(),
    }
    return HomeRepository.save(data)
  },

  async setImage(file) {
    const existing = await HomeRepository.get()
    const result = await uploadBuffer(file.buffer, 'yakutown/home')
    const data = {
      id:               'home',
      banner_image_url: result.secure_url,
      sections:         existing?.sections || [],
      updated_at:       new Date().toISOString(),
    }
    return HomeRepository.save(data)
  },
}

module.exports = HomeService
