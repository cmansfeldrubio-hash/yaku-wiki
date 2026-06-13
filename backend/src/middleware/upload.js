const multer = require('multer')

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(Object.assign(new Error('Formato de imagen no permitido. Usar: jpg, png, webp, gif'), { status: 400 }))
}

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  fileFilter,
  // Vercel serverless functions cap request bodies at 4.5 MB, so the file
  // limit must stay below that.
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
})

module.exports = upload
module.exports.galleryUpload = upload
