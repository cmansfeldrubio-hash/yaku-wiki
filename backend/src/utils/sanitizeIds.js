// Normalizes a raw character/event/location id list (array, JSON string, or
// comma-separated string) and drops any ids that don't exist in the given
// repository.
async function sanitizeIds(raw, repository) {
  let ids = raw
  if (typeof ids === 'string') {
    try { ids = JSON.parse(ids) } catch { ids = ids.split(',').map(s => s.trim()) }
  }
  if (!Array.isArray(ids)) return []
  const unique = [...new Set(ids.filter(Boolean))]
  const checks = await Promise.all(unique.map(id => repository.findById(id)))
  return unique.filter((_, i) => !!checks[i])
}

module.exports = { sanitizeIds }
