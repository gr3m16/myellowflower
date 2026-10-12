export const seedRegistry = {
  collected: new Set(),
  collect(level) {
    this.collected.add(level)
  },
  hasCollected(level) {
    return this.collected.has(level)
  },
  count() {
    return this.collected.size
  },
  reset() {
    this.collected = new Set()
  },
}