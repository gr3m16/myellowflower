class EventBus {
  constructor() {
    this.listeners = new Map()
  }

  on(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(fn)
    return () => this.off(event, fn)
  }

  off(event, fn) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(fn)
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((fn) => fn(payload))
    }
  }
}

export const bus = new EventBus()
export const GAME_EVENTS = {
  CINEMATIC_END: 'cinematic:end',
  GAME_READY: 'game:ready',
  MAZE_START: 'maze:start',
  MAZE_TIMEOUT: 'maze:timeout',
  MAZE_VICTORY: 'maze:victory',
  MAZE_RETRY: 'maze:retry',
  MAZE_QUIT: 'maze:quit',
}