const { v4: uuidv4 } = require('uuid')
const ComicRepository = require('../repositories/ComicRepository')
const { uploadBuffer, destroyAsset } = require('../utils/cloudinary')

function toSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const ComicService = {
  async list() {
    return ComicRepository.findAll()
  },

  async getBySlug(slug) {
    const comic = await ComicRepository.findBySlug(slug)
    if (!comic) throw Object.assign(new Error('Cómic no encontrado'), { status: 404 })
    const pages = await ComicRepository.getPages(comic.id)
    return { ...comic, pages }
  },

  async create({ file, body }) {
    const { title, format = 'normal', description = '' } = body
    if (!title) throw Object.assign(new Error('El título es requerido'), { status: 400 })
    if (!['manga', 'normal'].includes(format)) throw Object.assign(new Error('Formato inválido'), { status: 400 })

    const slug = toSlug(title)
    const existing = await ComicRepository.findBySlug(slug)
    if (existing) throw Object.assign(new Error('Ya existe un cómic con ese título'), { status: 409 })

    let cover_url = null
    let cover_cloudinary_id = null
    if (file) {
      const result = await uploadBuffer(file.buffer, 'yakutown/comics/covers')
      cover_url = result.secure_url
      cover_cloudinary_id = result.public_id
    }

    const now = new Date().toISOString()
    const comic = {
      id: uuidv4(),
      slug,
      title: title.trim(),
      format,
      description: description.trim(),
      cover_url,
      cover_cloudinary_id,
      created_at: now,
      updated_at: now,
    }
    return ComicRepository.create(comic)
  },

  async update(id, { file, body }) {
    const existing = await ComicRepository.findById(id)
    if (!existing) throw Object.assign(new Error('Cómic no encontrado'), { status: 404 })

    let cover_url = existing.cover_url
    let cover_cloudinary_id = existing.cover_cloudinary_id

    if (file) {
      if (existing.cover_cloudinary_id) await destroyAsset(existing.cover_cloudinary_id)
      const result = await uploadBuffer(file.buffer, 'yakutown/comics/covers')
      cover_url = result.secure_url
      cover_cloudinary_id = result.public_id
    }

    const updated = {
      ...existing,
      title:               body.title?.trim()       ?? existing.title,
      format:              body.format               ?? existing.format,
      description:         body.description?.trim()  ?? existing.description,
      cover_url,
      cover_cloudinary_id,
      updated_at:          new Date().toISOString(),
    }
    return ComicRepository.update(id, updated)
  },

  async remove(id) {
    const comic = await ComicRepository.findById(id)
    if (!comic) throw Object.assign(new Error('Cómic no encontrado'), { status: 404 })

    const pages = await ComicRepository.getPages(id)
    for (const page of pages) {
      if (page.cloudinary_id) await destroyAsset(page.cloudinary_id)
      await ComicRepository.removePage(page.id)
    }
    if (comic.cover_cloudinary_id) await destroyAsset(comic.cover_cloudinary_id)
    await ComicRepository.remove(id)
    return { message: 'Cómic eliminado', id }
  },

  async addPage(comicId, file) {
    if (!file) throw Object.assign(new Error('No se recibió ningún archivo'), { status: 400 })
    const comic = await ComicRepository.findById(comicId)
    if (!comic) throw Object.assign(new Error('Cómic no encontrado'), { status: 404 })

    const pages = await ComicRepository.getPages(comicId)
    const page_number = pages.length + 1

    const result = await uploadBuffer(file.buffer, `yakutown/comics/${comicId}`)
    const page = {
      id:            uuidv4(),
      comic_id:      comicId,
      page_number,
      image_url:     result.secure_url,
      cloudinary_id: result.public_id,
      uploaded_at:   new Date().toISOString(),
    }
    return ComicRepository.addPage(page)
  },

  async removePage(comicId, pageId) {
    const page = await ComicRepository.getPage(pageId)
    if (!page || page.comic_id !== comicId) throw Object.assign(new Error('Página no encontrada'), { status: 404 })
    if (page.cloudinary_id) await destroyAsset(page.cloudinary_id)
    await ComicRepository.removePage(pageId)

    // Renumber remaining pages
    const remaining = await ComicRepository.getPages(comicId)
    const reordered = remaining.map((p, i) => ({ id: p.id, page_number: i + 1 }))
    if (reordered.length) await ComicRepository.reorderPages(reordered)

    return { message: 'Página eliminada', id: pageId }
  },

  async reorderPages(comicId, order) {
    const pages = await ComicRepository.getPages(comicId)
    const pageIds = new Set(pages.map(p => p.id))
    if (!Array.isArray(order) || order.some(id => !pageIds.has(id))) {
      throw Object.assign(new Error('Orden inválido'), { status: 400 })
    }
    const reordered = order.map((id, i) => ({ id, page_number: i + 1 }))
    await ComicRepository.reorderPages(reordered)
    return ComicRepository.getPages(comicId)
  },
}

module.exports = ComicService
