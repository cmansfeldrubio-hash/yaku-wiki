const db = require('../data/db')

const ComicRepository = {
  async findAll() {
    const comics = await db.getComics()
    // Attach page count to each comic
    const withCounts = await Promise.all(
      comics.map(async c => {
        const pages = await db.getComicPages(c.id)
        return { ...c, page_count: pages.length }
      })
    )
    return withCounts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  },

  async findById(id) {
    return db.getComic(id) || null
  },

  async findBySlug(slug) {
    const comics = await db.getComics()
    return comics.find(c => c.slug === slug) || null
  },

  async create(comic) {
    return db.addComic(comic)
  },

  async update(id, data) {
    return db.updateComic(id, data)
  },

  async remove(id) {
    return db.removeComic(id)
  },

  async getPages(comicId) {
    return db.getComicPages(comicId)
  },

  async addPage(page) {
    return db.addComicPage(page)
  },

  async removePage(id) {
    return db.getComicPage(id).then(p => {
      if (!p) return null
      return db.removeComicPage(id).then(() => p)
    })
  },

  async getPage(id) {
    return db.getComicPage(id)
  },

  async reorderPages(pages) {
    return db.updateComicPagesOrder(pages)
  },
}

module.exports = ComicRepository
