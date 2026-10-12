import Phaser from 'phaser'
import { bus, GAME_EVENTS } from '../bus'
import { generateLevel, distFrom, mulberry32 } from '../utils/maze'
import { generateMazeTextures } from '../utils/mazeAssets'
import { attachDialogue } from '../ui/dialogue'
import { seedRegistry } from '../registry'
import { sfx } from '../sfx'

const CELL = 36
const OX = 30
const OY = 18
const FONT = '"Press Start 2P", "VT323", monospace'
const SPEED = 320
const SNAP_EPS = 10
const GRACE_MS = 2500
const SAFE_ZONE = 6
const ENEMY_HITBOX = 0.8

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

const LEVELS = [
  {
    n: 1,
    name: 'EL LABERINTO DE LA COMUNICACIÓN',
    seed: 'LA SEMILLA DE LA EMPATÍA Y LA COMUNICACIÓN',
    motto: 'contra la falta de comunicación y el orgullo',
    time: 90,
    seedKey: 'seed_empatia',
    intro: 'Papá, para vencer el orgullo y sanar las palabras, debemos comunicarnos con el corazón. ¡Encuentra la semilla dorada al final del laberinto!',
    congrats: '¡Lo lograste! Al comunicar con amor, el orgullo se deshizo como las sombras al amanecer. 🌻',
    enemies: [{ count: 1, behavior: 'patrol', speed: 40 }],
    theme: {
      bg: 'bg_dawn',
      camera: '#9fc4e8',
      veil: 0x27405f,
      frame: 0x16304a,
      tint: { color: 0xfff0c4, alpha: 0.1, blend: 'add' },
      wall: { face: 0x8fb8da, hi: 0xd8ecf7, mid: 0x688fb4, dk: 0x3f5e80, spark: 0xffffff },
      floor: { base: 0xc5dcf0, pellet: 0xffe9a8, alt: 0xa9c6e0 },
      overlay: 0xdff0ff,
      seedTint: 0xffe082,
    },
  },
  {
    n: 2,
    name: 'EL LABERINTO DE LA CONFIANZA',
    seed: 'LA SEMILLA DE LA CONFIANZA INQUEBRANTABLE',
    motto: 'contra los celos y las suposiciones',
    time: 100,
    seedKey: 'seed_confianza',
    intro: 'Los celos y las suposiciones nublan los ojos. Déjame iluminarte el camino, papá: sígueme con confianza. 🌟',
    congrats: '¡Inquebrantable! La confianza vence los celos y disuelve toda suposición. 🌟',
    enemies: [{ count: 3, behavior: 'line', speed: 44, chaseSpeed: 66 }],
    theme: {
      bg: 'bg_sunset',
      camera: '#d8783a',
      veil: 0x4a2522,
      frame: 0x3a1a20,
      tint: { color: 0xff9a3b, alpha: 0.1, blend: 'add' },
      wall: { face: 0xc97b4a, hi: 0xf2c48e, mid: 0x9c5a33, dk: 0x5f3320, spark: 0xffe9b6 },
      floor: { base: 0xf0c892, pellet: 0xff7b3a, alt: 0xd9a868 },
      overlay: 0xffcf8f,
      seedTint: 0xffd94a,
    },
  },
  {
    n: 3,
    name: 'EL LABERINTO DE LA ADMIRACIÓN',
    seed: 'LA SEMILLA DE LA ADMIRACIÓN Y EL CUIDADO',
    motto: 'contra la rutina y la indiferencia',
    time: 120,
    seedKey: 'seed_admiracion',
    intro: 'El respeto, la atención y el cuidado diario se siembran un día a la vez. ¡Admira y cuida cada detalle, papá! 🌻',
    congrats: '¡Admirable! La rutina y la indiferencia ya no tienen lugar: sembramos admiración y cuidado. 🌻',
    enemies: [{ count: 4, behavior: 'hunter', speed: Math.round(SPEED * 0.85) }],
    theme: {
      bg: 'bg_nightforest',
      camera: '#241048',
      veil: 0x0d0521,
      frame: 0x0d0521,
      tint: { color: 0x140f2e, alpha: 0.26, blend: 'overlay' },
      wall: { face: 0x3a1f6d, hi: 0x8a5ac4, mid: 0x2a1446, dk: 0x150a2b, spark: 0xd9b8ff },
      floor: { base: 0x281252, pellet: 0xa585f6, alt: 0x1c0d3e },
      overlay: 0xa585f6,
      seedTint: 0xfff3c4,
    },
  },
]

function centerOf(tile) {
  return {
    x: tile.x * CELL + OX + CELL / 2,
    y: tile.y * CELL + OY + CELL / 2,
  }
}

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene')
    this.level = 1
    this.playing = false
    this.gen = 0
    this.failing = false
  }

  create() {
    seedRegistry.reset()
    this.environment = []
    this.enemies = []
    this.generateAssets()
    this.dlg = attachDialogue(this)

    this.timerText = null
    this.levelLabelText = null
    this.levelNameText = null
    this.enemiesHudText = null
    this.seedsHudText = null
    this.buildHud()

    this.player = this.physics.add.sprite(0, 0, 'padre').setDepth(9).setScale(0.25)
    this.player.body.setSize(56, 88, true)
    this.player.body.setOffset(20, 4)
    this.player.setCollideWorldBounds(true)
    this.gui = this.add.image(0, 0, 'gui').setDepth(9).setScale(0.3)
    this.playerShadow = this.add.image(0, 0, 'shadow').setDepth(8).setScale(0.8)
    this.guiShadow = this.add.image(0, 0, 'shadow').setDepth(8).setScale(0.65)

    this.keys = this.input.keyboard.addKeys('UP,LEFT,RIGHT,DOWN')
    this.input.keyboard.addCapture('UP,LEFT,RIGHT,DOWN,SPACE')

    this.offStart = bus.on(GAME_EVENTS.MAZE_RETRY, () => this.retryLevel())
    this.offQuit = bus.on(GAME_EVENTS.MAZE_QUIT, () => this.scene.stop())
    this.events.once('shutdown', () => {
      if (this.offStart) this.offStart()
      if (this.offQuit) this.offQuit()
    })

    this.cameras.main.fadeIn(900, 14, 6, 40)

    if (typeof window !== 'undefined') {
      window.__maze = this
      window.__registry = seedRegistry
    }

    this.startLevel(this.level, true)
  }

  generateAssets() {
    if (!this.textures.exists('maze_wall')) {
      generateMazeTextures(this)
    }
  }

  buildEnvironment() {
    const th = this.info.theme
    this.environment.push(this.add.image(480, 270, th.bg).setDepth(0))

    if (th.tint) {
      const t = this.add.rectangle(480, 270, 960, 540, th.tint.color, th.tint.alpha).setDepth(6)
      if (th.tint.blend === 'add') t.setBlendMode(Phaser.BlendModes.ADD)
      this.environment.push(t)
    }

    if (th.decor === 'dawn') this.decorDawn()
    else if (th.decor === 'sunset') this.decorSunset()
    else this.decorNight()
  }

  clearEnvironment() {
    for (const o of this.environment) {
      if (o && o.active) {
        this.tweens.killTweensOf(o)
        o.destroy()
      }
    }
    this.environment = []
  }

  makeFloater(texture, opts = {}) {
    const o = {
      x: opts.x ?? Phaser.Math.Between(40, 920),
      y: opts.y ?? Phaser.Math.Between(40, 470),
      count: opts.count ?? 10,
      tint: opts.tint ?? 0xffffff,
      scale: opts.scale ?? 0.6,
      alpha: opts.alpha ?? 0.5,
      dr: opts.dr ?? Phaser.Math.Between(7000, 10000),
      dy: opts.dy ?? 130,
    }
    for (let i = 0; i < o.count; i++) {
      const s = this.add
        .image(
          Phaser.Math.Between(40, 920),
          Phaser.Math.Between(60, 470),
          texture
        )
        .setDepth(8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(o.alpha * Phaser.Math.FloatBetween(0.4, 1))
        .setScale(o.scale * Phaser.Math.FloatBetween(0.6, 1.3))
      if (o.tint) s.setTint(o.tint)
      const x0 = s.x
      this.tweens.add({
        targets: s,
        y: { from: s.y, to: s.y - o.dy },
        x: x0 + Phaser.Math.Between(-60, 60),
        duration: o.dr,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 300,
      })
      this.tweens.add({ targets: s, alpha: { from: 0.1, to: o.alpha }, duration: o.dr / 2, yoyo: true, repeat: -1, delay: i * 300 })
      this.environment.push(s)
    }
  }

  decorDawn() {
    this.makeFloater('spark', { count: 10, tint: 0xffe9a8, dr: 8000, dy: 140 })
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(0, 0, 'petal').setDepth(8).setAlpha(0.7).setScale(0.8).setTint(0xfff3c4)
      const x0 = 90 + i * 240
      p.setPosition(x0, -14)
      this.tweens.add({ targets: p, y: 560, x: { from: x0, to: x0 + 60 }, duration: 6500 + i * 900, repeat: -1, onRepeat: () => { p.x = x0 + Phaser.Math.Between(-20, 20) } })
      this.tweens.add({ targets: p, rotation: { from: 0, to: Phaser.Math.Between(-3, 3) }, duration: 6500, yoyo: true, repeat: -1 })
      this.environment.push(p)
    }
  }

  decorSunset() {
    this.makeFloater('spark', { count: 12, tint: 0xff7b3a, dr: 9000, dy: 120 })
    for (let i = 0; i < 2; i++) {
      const p = this.add.image(0, 0, 'petal').setDepth(8).setAlpha(0.7).setScale(0.9).setTint(0xff9a3b)
      const x0 = 140 + i * 360
      p.setPosition(x0, -14)
      this.tweens.add({ targets: p, y: 560, x: { from: x0, to: x0 + 90 }, duration: 7800 + i * 700, repeat: -1, onRepeat: () => { p.x = x0 + Phaser.Math.Between(-20, 20) } })
      this.tweens.add({ targets: p, rotation: Phaser.Math.Between(-3, 3), duration: 7800, yoyo: true, repeat: -1 })
      this.environment.push(p)
    }
  }

  decorNight() {
    for (let i = 0; i < 16; i++) {
      const s = this.add
        .image(Phaser.Math.Between(40, 920), Phaser.Math.Between(40, 470), 'firefly')
        .setDepth(8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.5)
        .setScale(0.6)
      this.tweens.add({ targets: s, alpha: { from: 0.12, to: 0.7 }, duration: 1100 + (i % 4) * 500, yoyo: true, repeat: -1, delay: i * 220 })
      this.environment.push(s)
    }
    for (let i = 0; i < 4; i++) {
      const p = this.add.image(0, 0, 'petal').setDepth(8).setAlpha(0.6).setScale(0.7).setTint(0xb98aff)
      const x0 = 120 + i * 200
      p.setPosition(x0, -14)
      this.tweens.add({ targets: p, y: 560, x: { from: x0, to: x0 + 70 }, duration: 9000 + i * 600, repeat: -1, onRepeat: () => { p.x = x0 + Phaser.Math.Between(-20, 20) } })
      this.tweens.add({ targets: p, rotation: Phaser.Math.Between(-3, 3), duration: 9000, yoyo: true, repeat: -1 })
      this.environment.push(p)
    }
  }

  buildHud() {
    this.add.rectangle(166, 30, 300, 56, 0x070316, 0.55).setStrokeStyle(2, 0xffd700, 0.3).setDepth(19)
    this.add.rectangle(512, 30, 236, 56, 0x070316, 0.55).setStrokeStyle(2, 0xffd700, 0.5).setDepth(19)
    this.add.rectangle(900, 30, 118, 56, 0x070316, 0.55).setStrokeStyle(2, 0xffd700, 0.3).setDepth(19)

    this.levelLabelText = this.add
      .text(24, 14, '', { fontFamily: FONT, fontSize: '9px', color: '#ffd700' })
      .setDepth(20)
      .setOrigin(0, 0.5)
    this.levelNameText = this.add
      .text(24, 40, '', { fontFamily: FONT, fontSize: '6.5px', color: '#cfa9f5', wordWrap: { width: 284 } })
      .setDepth(20)
      .setOrigin(0, 0.5)
      .setLineSpacing(2)
    this.seedsHudText = this.add
      .text(948, 24, '', { fontFamily: FONT, fontSize: '9px', color: '#ffd700' })
      .setDepth(20)
      .setOrigin(1, 0.5)
    this.enemiesHudText = this.add
      .text(948, 46, '', { fontFamily: FONT, fontSize: '8px', color: '#f5e1ff' })
      .setDepth(20)
      .setOrigin(1, 0.5)
    this.add
      .text(512, 13, 'TIEMPO', { fontFamily: FONT, fontSize: '7px', color: '#e8c65a' })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
    this.timerText = this.add
      .text(512, 30, '01:30', { fontFamily: FONT, fontSize: '16px', color: '#ffffff' })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
    this.add
      .text(512, 50, 'ENCUENTRA LA SEMILLA ☀', { fontFamily: FONT, fontSize: '6px', color: '#f5e1ff' })
      .setDepth(20)
      .setOrigin(0.5, 0.5)
  }

  startLevel(idx, withIntro) {
    const gen = ++this.gen
    if (this.levelContainer) {
      this.levelContainer.destroy(true)
      this.levelContainer = null
    }
    this.clearLevelPhysics()
    this.clearEnvironment()
    if (this.timerEvent) this.timerEvent.remove()
    if (this.guideEvent) {
      this.guideEvent.remove()
      this.guideEvent = null
    }
    this.level = idx
    this.info = LEVELS[idx - 1]
    this.maze = generateLevel(idx)
    this.grid = this.maze.grid
    this.timeLeft = this.info.time
    this.playing = false
    this.moving = false
    this.stunned = false
    this.failing = false
    this.enemyCount = this.info.enemies.reduce((a, e) => a + e.count, 0)
    this.enemyGraceUntil = Infinity

    this.cameras.main.setBackgroundColor(this.info.theme.camera)
    this.buildEnvironment()
    this.buildMazeVisual()
    this.buildColliders()
    this.buildEnemies()

    const c = centerOf(this.maze.start)
    this.px = this.maze.start.x
    this.py = this.maze.start.y
    this.moving = false
    this.dir = { x: 0, y: 0 }
    this.player.setPosition(c.x, c.y).setVelocity(0, 0).setVisible(true).setFlipX(false)
    this.playerShadow.setPosition(c.x, c.y + 14).setVisible(true)
    this.gui.setPosition(c.x - 46, c.y).setVisible(true).setFlipX(false)
    this.guiShadow.setPosition(c.x - 46, c.y + 14).setVisible(true)
    this.foot = [{ x: c.x - 46, y: c.y }, { x: c.x, y: c.y }]

    this.renderHud(idx)

    const finish = () => {
      if (gen !== this.gen) return
      if (this.level === 2) this.startGuide()
      this.startTimer()
      this.enemyGraceUntil = this.time.now + GRACE_MS
      this.time.delayedCall(GRACE_MS, () => {
        if (gen === this.gen) this.releaseEnemies()
      })
      this.playing = true
      bus.emit(GAME_EVENTS.MAZE_START, { level: idx })
    }

    if (withIntro) {
      this.runIntro(gen).then(() => finish())
    } else {
      finish()
    }
  }

  renderHud(idx) {
    this.levelLabelText.setText(`NIVEL ${idx} DE 3`)
    this.levelNameText.setText(this.info.name)
    this.enemiesHudText.setText(`CIZAÑA: ${this.enemyCount}`)
    this.seedsHudText.setText(`SEMILLA: ${idx - 1}/3`)
    this.updateTimerText()
  }

  updateTimerText() {
    const s = Math.max(0, Math.ceil(this.timeLeft))
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    this.timerText.setText(`${mm}:${ss}`)
    this.timerText.setColor(s <= 10 ? '#ff5a4e' : '#ffffff')
    if (s <= 10) {
      this.tweens.add({ targets: this.timerText, scaleX: { from: 1.15, to: 1 }, duration: 200, delay: 150 })
    }
  }

  startTimer() {
    this.timerEvent = this.time.addEvent({ delay: 1000, loop: true, callback: this.onTick, callbackScope: this })
  }

  onTick() {
    if (!this.playing) return
    this.timeLeft -= 1
    this.updateTimerText()
    if (this.timeLeft <= 10 && this.timeLeft > 0) sfx.tick()
    if (this.timeLeft <= 0) {
      this.playing = false
      if (this.timerEvent) this.timerEvent.remove()
      this.timeout()
    }
  }

  timeout() {
    this.stopMovement()
    sfx.trap()
    this.cameras.main.shake(0.25, 0.006)
    const flash = this.add.rectangle(480, 270, 960, 540, 0xff3a2a, 0.12).setDepth(40)
    this.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() })
    this.showToast('¡TIEMPO AGOTADO!', 0xff5a4e)
    this.time.delayedCall(800, () => bus.emit(GAME_EVENTS.MAZE_TIMEOUT, { level: this.level }))
  }

  failLevel(msg, color = 0xff4bd6) {
    if (!this.playing || this.failing) return
    this.failing = true
    this.playing = false
    this.stopMovement()
    sfx.trap()
    this.cameras.main.shake(0.25, 0.008)
    const flash = this.add.rectangle(480, 270, 960, 540, color, 0.16).setDepth(41)
    this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() })
    this.showToast(msg, color)
    this.time.delayedCall(850, () => {
      if (this.gen) this.startLevel(this.level, false)
    })
  }

  showToast(txt, color = '#ffd700') {
    const t = this.add
      .text(480, 250, txt, { fontFamily: FONT, fontSize: '20px', color, align: 'center', backgroundColor: 'rgba(7,3,22,0.8)', padding: { x: 18, y: 10 } })
      .setOrigin(0.5)
      .setDepth(60)
    this.tweens.add({ targets: t, alpha: 0, duration: 1600, onComplete: () => t.destroy() })
  }

  async runIntro(gen) {
    const veil = this.add.rectangle(480, 270, 960, 540, this.info.theme.veil, 0.9).setDepth(58)
    const title1 = this.add.text(480, 150, `NIVEL ${this.level} DE 3`, { fontFamily: FONT, fontSize: '12px', color: '#cfa9f5' }).setOrigin(0.5).setDepth(60)
    const title2 = this.add.text(480, 186, this.info.name, { fontFamily: FONT, fontSize: '17px', color: '#ffd700', align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5).setDepth(60)
    const sub = this.add.text(480, 246, this.info.motto, { fontFamily: FONT, fontSize: '10px', color: '#f5e1ff', align: 'center' }).setOrigin(0.5).setDepth(60)
    const seedLbl = this.add.text(480, 300, `LA SEMILLA: ${this.info.seed}`, { fontFamily: FONT, fontSize: '9px', color: '#e8c65a', align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5).setDepth(60)
    const objective = this.add.text(480, 352, 'ENCUENTRA LA SEMILLA DORADA', { fontFamily: FONT, fontSize: '11px', color: '#ffffff' }).setOrigin(0.5).setDepth(60)
    const hint = this.add
      .text(480, 430, this.info.intro, { fontFamily: FONT, fontSize: '9px', color: '#dcc9f2', align: 'center', wordWrap: { width: 780 } })
      .setOrigin(0.5)
      .setDepth(60)
    const go = this.add
      .text(480, 500, '— ESPACIO / CLIC PARA COMENZAR —', { fontFamily: FONT, fontSize: '8px', color: '#ffd700' })
      .setOrigin(0.5)
      .setDepth(60)
    this.tweens.add({ targets: [title2, go], y: '+=4', duration: 900, yoyo: true, repeat: -1 })

    await this.waitPress()
    if (gen !== this.gen) return
    this.tweens.add({ targets: [veil, title1, title2, sub, seedLbl, objective, hint, go], alpha: 0, duration: 420, onComplete: () => { veil.destroy(); title1.destroy(); title2.destroy(); sub.destroy(); seedLbl.destroy(); objective.destroy(); hint.destroy(); go.destroy() } })
  }

  solveDistNeighbor(x, y) {
    const d = this.maze.dist
    if (!d) return null
    const cur = d[y][x]
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]
    let best = null
    let bestD = cur
    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= this.maze.cols || ny >= this.maze.rows) continue
      if (this.grid[ny][nx] === '#') continue
      if (d[ny][nx] < bestD) {
        bestD = d[ny][nx]
        best = centerOf({ x: nx, y: ny })
      }
    }
    return best
  }

  buildMazeVisual() {
    const container = this.add.container(0, 0)
    container.depth = 5
    const floor = this.add.graphics()
    const walls = this.add.graphics()
    const overlay = this.add.graphics()
    const { rows, cols, grid } = this.maze
    const th = this.info.theme

    floor.fillStyle(th.frame, 1)
    floor.fillRect(OX - 14, OY - 14, cols * CELL + 28, rows * CELL + 28)

    const F_BASE = th.floor.base
    const F_PELLET = th.floor.pellet
    const F_ALT = th.floor.alt
    const W_FACE = th.wall.face
    const W_HI = th.wall.hi
    const W_MID = th.wall.mid
    const W_DK = th.wall.dk
    const W_SPARK = th.wall.spark

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * CELL + OX
        const py = y * CELL + OY
        if (grid[y][x] === '#') {
          walls.fillStyle(W_FACE, 1)
          walls.fillRect(px, py, CELL, CELL)
          walls.fillStyle(W_HI, 1)
          walls.fillRect(px, py, CELL, 5)
          walls.fillRect(px, py, 5, CELL)
          walls.fillStyle(W_MID, 0.9)
          walls.fillRect(px + CELL - 5, py, 5, CELL)
          walls.fillRect(px, py + CELL - 5, CELL, 5)
          walls.fillStyle(W_DK, 1)
          walls.fillRect(px + 6, py + CELL - 3, CELL - 12, 3)
          walls.fillRect(px + CELL - 3, py + 6, 3, CELL - 12)
          walls.fillStyle(W_DK, 0.5)
          if ((x + y) % 2 === 0) {
            walls.fillRect(px + CELL / 2 - 2, py + 6, 4, CELL - 12)
          } else {
            walls.fillRect(px + 6, py + CELL / 2 - 2, CELL - 12, 4)
          }
          walls.fillStyle(W_SPARK, 0.95)
          walls.fillRect(px + CELL - 8, py + 7, 2, 2)
          walls.fillRect(px + 7, py + CELL - 8, 2, 2)
        } else {
          floor.fillStyle(F_BASE, 1)
          floor.fillRect(px, py, CELL, CELL)
          floor.fillStyle(F_PELLET, 0.7)
          floor.fillRect(px + CELL / 2 - 2, py + CELL / 2 - 2, 4, 4)
          if ((x + y) % 2 === 1) {
            floor.fillStyle(F_ALT, 0.6)
            floor.fillRect(px + CELL - 7, py + CELL - 7, 3, 3)
          }
        }
      }
    }

    overlay.lineStyle(1, th.overlay, 0.12)
    for (let y = 0; y <= rows; y++) {
      overlay.moveTo(OX, y * CELL + OY)
      overlay.lineTo(OX + cols * CELL, y * CELL + OY)
    }
    for (let x = 0; x <= cols; x++) {
      overlay.moveTo(x * CELL + OX, OY)
      overlay.lineTo(x * CELL + OX, OY + rows * CELL)
    }
    overlay.lineStyle(2, th.overlay, 0.5)
    overlay.strokeRect(OX - 14, OY - 14, cols * CELL + 28, rows * CELL + 28)

    container.add([floor, walls, overlay])

    this.levelContainer = container
  }

  buildColliders() {
    const { rows, cols, grid } = this.maze

    this.wallGroup = this.physics.add.staticGroup()
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x] !== '#') continue
        const c = centerOf({ x, y })
        this.wallGroup.create(c.x, c.y, 'maze_wall').setVisible(false).refreshBody()
      }
    }
    this.wallCollider = this.physics.add.collider(this.player, this.wallGroup)

    this.trapSprites = []
    for (const t of this.maze.traps) {
      const c = centerOf(t)
      const glow = this.add.image(c.x, c.y, 'halo').setDepth(6.5).setTint(0xff5aa8).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.45).setScale(0.6)
      this.tweens.add({ targets: glow, alpha: { from: 0.2, to: 0.6 }, scale: { from: 0.5, to: 0.8 }, duration: 800, yoyo: true, repeat: -1 })
      const sp = this.physics.add.staticSprite(c.x, c.y, 'thorn').setDepth(7).setScale(0.85)
      sp.body.setSize(24, 24, true)
      sp._glow = glow
      this.tweens.add({ targets: sp, scaleX: { from: 0.78, to: 0.95 }, scaleY: { from: 0.78, to: 0.95 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.tweens.add({ targets: sp, y: c.y - 2, duration: 700, yoyo: true, repeat: -1 })
      this.trapSprites.push(sp)
    }
    this.trapOverlap = this.physics.add.overlap(this.player, this.trapSprites, (p, spr) => {
      if (!this.playing || this.stunned || this.failing) return
      this.failLevel('¡CUIDADO CON LAS ESPINAS!', 0xff5aa8)
    })

    const ec = centerOf(this.maze.exit)
    this.seedSprite = this.physics.add.staticSprite(ec.x, ec.y, this.info.seedKey).setDepth(8).setScale(0.55).setTint(this.info.theme.seedTint)
    this.seedSprite.body.setSize(28, 28, true)
    this.seedHalo = this.add.image(ec.x, ec.y, 'halo').setDepth(7).setScale(0.5).setAlpha(0.8).setTint(this.info.theme.seedTint).setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: this.seedHalo, scale: { from: 0.42, to: 0.62 }, alpha: { from: 0.85, to: 0.25 }, duration: 900, yoyo: true, repeat: -1 })
    this.seedOverlap = this.physics.add.overlap(this.player, this.seedSprite, (p, spr) => {
      if (!this.playing || !this.seedSprite || this.failing) return
      this.reachSeed()
    })
  }

  buildEnemies() {
    this.enemies = []
    const spawns = this.enemySpawnTiles(this.enemyCount)
    let k = 0
    for (const cfg of this.info.enemies) {
      for (let i = 0; i < cfg.count; i++) {
        const tile = spawns[k++] || this.safeFallbackSpawn()
        const c = centerOf(tile)
        const spr = this.physics.add.sprite(c.x, c.y, 'cizana_mini').setDepth(9.5)
        spr.setScale(1.1)
        spr.body.moves = false
        spr.body.setSize(12.8, 12.8, true)
        spr.setAlpha(0.5)
        const e = {
          spr,
          cell: { x: tile.x, y: tile.y },
          behavior: cfg.behavior || 'patrol',
          speed: cfg.speed || 40,
          chaseSpeed: cfg.chaseSpeed || 0,
          chase: cfg.behavior !== 'patrol',
          dir: [Math.random() < 0.5 ? 1 : -1, 0],
          interval: (CELL / (cfg.speed || 40)) * 1000,
          next: this.time.now,
          tween: null,
          blinkTween: this.tweens.add({ targets: spr, alpha: { from: 0.55, to: 0.2 }, duration: 380, yoyo: true, repeat: -1 }),
        }
        this.enemies.push(e)
      }
    }
  }

  enemySpawnTiles(count) {
    const s = this.maze.start
    const cand = []
    for (let y = 0; y < this.maze.rows; y++) {
      for (let x = 0; x < this.maze.cols; x++) {
        if (this.grid[y][x] === '#') continue
        if (x === s.x && y === s.y) continue
        if (x === this.maze.exit.x && y === this.maze.exit.y) continue
        if (Math.abs(x - s.x) + Math.abs(y - s.y) <= SAFE_ZONE) continue
        cand.push({ x, y })
      }
    }
    const rng = mulberry32(this.level * 104729 + 7)
    for (let i = cand.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = cand[i]
      cand[i] = cand[j]
      cand[j] = tmp
    }
    return cand.slice(0, count)
  }

  safeFallbackSpawn() {
    const s = this.maze.start
    let best = { x: this.maze.exit.x, y: this.maze.exit.y }
    let bd = -1
    for (let y = 0; y < this.maze.rows; y++) {
      for (let x = 0; x < this.maze.cols; x++) {
        if (this.grid[y][x] === '#') continue
        const d = Math.abs(x - s.x) + Math.abs(y - s.y)
        if (d > bd) {
          bd = d
          best = { x, y }
        }
      }
    }
    return best
  }

  releaseEnemies() {
    for (const e of this.enemies) {
      if (e.blinkTween) {
        this.tweens.remove(e.blinkTween)
        e.blinkTween = null
      }
      this.tweens.add({ targets: e.spr, alpha: 1, duration: 300 })
    }
  }

  clearLevelPhysics() {
    if (this.wallCollider) {
      this.wallCollider.destroy()
      this.wallCollider = null
    }
    if (this.wallGroup) {
      this.wallGroup.destroy(true)
      this.wallGroup = null
    }
    if (this.trapOverlap) {
      this.trapOverlap.destroy()
      this.trapOverlap = null
    }
    if (this.seedOverlap) {
      this.seedOverlap.destroy()
      this.seedOverlap = null
    }
    if (this.trapSprites) {
      for (const sp of this.trapSprites) {
        this.tweens.killTweensOf(sp)
        if (sp._glow) {
          this.tweens.killTweensOf(sp._glow)
          sp._glow.destroy()
        }
        if (sp && sp.active) sp.destroy()
      }
      this.trapSprites = []
    }
    if (this.seedSprite) {
      this.seedSprite.destroy()
      this.seedSprite = null
    }
    if (this.seedHalo) {
      this.seedHalo.destroy()
      this.seedHalo = null
    }
    if (this.enemies) {
      for (const e of this.enemies) {
        if (e.tween) this.tweens.killTweensOf(e.spr)
        if (e.spr && e.spr.active) e.spr.destroy()
      }
      this.enemies = []
    }
  }

  update(time, delta) {
    if (this.stunned) {
      this.player.setVelocity(0, 0)
      return
    }
    if (!this.playing || this.failing) return
    this.stepMovement()
    this.followGui()
    this.stepEnemies(time)
    if (this.checkEnemyTouch(time)) return
  }

  canEnter(x, y) {
    if (x < 0 || y < 0 || x >= this.maze.cols || y >= this.maze.rows) return false
    return this.grid[y][x] !== '#'
  }

  stepMovement() {
    const k = this.keys
    let dx = 0
    let dy = 0
    if (k.UP.isDown) dy = -1
    else if (k.DOWN.isDown) dy = 1
    else if (k.LEFT.isDown) dx = -1
    else if (k.RIGHT.isDown) dx = 1

    const p = this.player

    if (this.moving) {
      if (Math.abs(this.player.body.velocity.x) < 1 && Math.abs(this.player.body.velocity.y) < 1) {
        const nc = centerOf({ x: this.px + this.dir.x, y: this.py + this.dir.y })
        const off = this.dir.x !== 0 ? Math.abs(p.x - nc.x) : Math.abs(p.y - nc.y)
        if (off <= SNAP_EPS) {
          p.setPosition(nc.x, nc.y)
          this.px += this.dir.x
          this.py += this.dir.y
          this.onArrive(nc)
        } else {
          this.stopMovement()
        }
        return
      }
      if (dy === 0 && dx !== 0 && dx === -this.dir.x) {
        this.reverse(dx, 0)
        return
      }
      if (dx === 0 && dy !== 0 && dy === -this.dir.y) {
        this.reverse(0, dy)
        return
      }
      const nc = centerOf({ x: this.px + this.dir.x, y: this.py + this.dir.y })
      const off = this.dir.x !== 0 ? Math.abs(p.x - nc.x) : Math.abs(p.y - nc.y)
      if (off <= SNAP_EPS) {
        p.setPosition(nc.x, nc.y)
        this.px += this.dir.x
        this.py += this.dir.y
        this.onArrive(nc)
      }
      return
    }

    if ((dx !== 0 || dy !== 0) && this.canEnter(this.px + dx, this.py + dy)) {
      this.beginMove(dx, dy)
    } else if (dx !== 0 || dy !== 0) {
      if (dx !== 0) p.setFlipX(dx < 0)
    }
  }

  reverse(dx, dy) {
    this.dir.x = dx
    this.dir.y = dy
    this.player.setVelocity(dx * SPEED, dy * SPEED)
    if (dx !== 0) this.player.setFlipX(dx < 0)
  }

  beginMove(dx, dy) {
    this.moving = true
    this.dir.x = dx
    this.dir.y = dy
    const p = this.player
    const cc = centerOf({ x: this.px, y: this.py })
    p.setPosition(cc.x, cc.y)
    if (dx !== 0) p.setFlipX(dx < 0)
    p.setVelocity(dx * SPEED, dy * SPEED)
    sfx.step()
  }

  onArrive(c) {
    this.foot.push({ x: c.x, y: c.y })
    if (this.foot.length > 16) this.foot.shift()

    const k = this.keys
    let dx = 0
    let dy = 0
    if (k.UP.isDown) dy = -1
    else if (k.DOWN.isDown) dy = 1
    else if (k.LEFT.isDown) dx = -1
    else if (k.RIGHT.isDown) dx = 1

    if ((dx !== 0 || dy !== 0) && this.canEnter(this.px + dx, this.py + dy)) {
      this.beginMove(dx, dy)
    } else {
      this.stopMovement()
    }
  }

  stopMovement() {
    this.moving = false
    this.dir.x = 0
    this.dir.y = 0
    this.player.setVelocity(0, 0)
  }

  followGui() {
    const idx = Math.max(0, this.foot.length - 3)
    const target = this.foot[idx]
    if (!target) return
    this.gui.x += (target.x - this.gui.x) * 0.12
    this.gui.y += (target.y - this.gui.y) * 0.18
    this.guiShadow.x = this.gui.x
    this.guiShadow.y = this.gui.y + 12
    this.playerShadow.x = this.player.x
    this.playerShadow.y = this.player.y + 12
  }

  stepEnemies(now) {
    if (!this.enemies.length) return
    if (now < this.enemyGraceUntil) return
    for (const e of this.enemies) {
      if (e.next > now) continue
      if (e.tween && e.tween.isPlaying()) continue
      let to
      let interval = e.interval
      if (e.behavior === 'hunter') {
        interval = (CELL / e.speed) * 1000
        to = this.chaseStep(e)
      } else if (e.behavior === 'line') {
        const los = this.hasLOS(e, this.px, this.py)
        if (los && e.chaseSpeed) {
          interval = (CELL / e.chaseSpeed) * 1000
          to = this.stepTowardLOS(e, this.px, this.py)
        } else {
          interval = (CELL / e.speed) * 1000
          to = this.patrolStep(e)
        }
      } else {
        interval = (CELL / e.speed) * 1000
        to = this.patrolStep(e)
      }
      e.next = now + interval
      const from = { x: e.cell.x, y: e.cell.y }
      if (to) {
        e.cell = to
        const c = centerOf(to)
        if (to.x !== from.x) e.spr.setFlipX(to.x < from.x)
        e.tween = this.tweens.add({ targets: e.spr, x: c.x, y: c.y, duration: interval, ease: 'Linear' })
      }
    }
  }

  chaseStep(e) {
    const d = distFrom(this.grid, this.px, this.py)
    return this.bestNeighbor(e.cell, d)
  }

  hasLOS(e, px, py) {
    const c = e.cell
    if (c.x === px) {
      const lo = Math.min(c.y, py) + 1
      const hi = Math.max(c.y, py)
      for (let y = lo; y < hi; y++) if (this.grid[y][c.x] === '#') return false
      return true
    }
    if (c.y === py) {
      const lo = Math.min(c.x, px) + 1
      const hi = Math.max(c.x, px)
      for (let x = lo; x < hi; x++) if (this.grid[c.y][x] === '#') return false
      return true
    }
    return false
  }

  stepTowardLOS(e, px, py) {
    const c = e.cell
    let nx = c.x
    let ny = c.y
    if (c.x === px) ny += py > c.y ? 1 : -1
    else if (c.y === py) nx += px > c.x ? 1 : -1
    else return this.patrolStep(e)
    if (this.canEnter(nx, ny)) {
      e.dir = [nx - c.x, ny - c.y]
      return { x: nx, y: ny }
    }
    return this.patrolStep(e)
  }

  patrolStep(e) {
    const [dx, dy] = e.dir
    if (this.canEnter(e.cell.x + dx, e.cell.y + dy)) {
      return { x: e.cell.x + dx, y: e.cell.y + dy }
    }
    e.dir = [-dx, -dy]
    if (this.canEnter(e.cell.x - dx, e.cell.y - dy)) {
      return { x: e.cell.x - dx, y: e.cell.y - dy }
    }
    for (const [nx, ny] of [[dy, dx], [-dy, -dx]]) {
      if (this.canEnter(e.cell.x + nx, e.cell.y + ny)) {
        e.dir = [nx, ny]
        return { x: e.cell.x + nx, y: e.cell.y + ny }
      }
    }
    return null
  }

  bestNeighbor(cell, dist) {
    const cur = dist[cell.y]?.[cell.x]
    let best = null
    let bestD = cur
    for (const [dx, dy] of DIRS) {
      const tx = cell.x + dx
      const ty = cell.y + dy
      if (!this.canEnter(tx, ty)) continue
      const dd = dist[ty]?.[tx]
      if (dd === undefined || dd === Infinity) continue
      if (dd < bestD) {
        bestD = dd
        best = { x: tx, y: ty }
      }
    }
    return best
  }

  checkEnemyTouch(now) {
    if (now < this.enemyGraceUntil) return false
    const pb = this.player.body
    for (const e of this.enemies) {
      const eb = e.spr.body
      if (eb.right > pb.left && eb.left < pb.right && eb.bottom > pb.top && eb.top < pb.bottom) {
        this.failLevel('¡LA CIZAÑA TE ATRAPÓ!', 0xff4bd6)
        return true
      }
    }
    return false
  }

  startGuide() {
    if (this.level === 2 && !this.guideEvent) {
      this.guideEvent = this.time.addEvent({ delay: 3400, loop: true, callback: this.spawnWisp, callbackScope: this })
    }
  }

  spawnWisp() {
    if (!this.playing) return
    const t = this.solveDistNeighbor(this.px, this.py)
    if (!t) return
    sfx.wisp()
    const w = this.add.image(this.gui.x, this.gui.y - 8, 'halo').setDepth(10).setScale(0.3).setAlpha(0.0).setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.chain({
      targets: w,
      tweens: [
        { x: t.x + Phaser.Math.Between(-6, 6), y: t.y - 12, alpha: { from: 0.2, to: 0.9 }, scale: { from: 0.2, to: 0.6 }, duration: 600 },
        { alpha: 0, scale: 0.25, duration: 380 },
      ],
    })
    this.time.delayedCall(1100, () => w.destroy())
  }

  reachSeed() {
    if (!this.playing || this.failing) return
    const gen = this.gen
    this.playing = false
    this.stopMovement()
    if (this.timerEvent) this.timerEvent.remove()
    sfx.bloom()
    seedRegistry.collect(this.level)
    const ec = centerOf(this.maze.exit)
    const spr = this.seedSprite
    this.seedSprite = null
    if (spr) {
      spr.disableBody(true, true)
      this.time.delayedCall(120, () => spr.destroy())
    }
    if (this.seedHalo) {
      this.seedHalo.destroy()
      this.seedHalo = null
    }

    this.burstParticles(ec.x, ec.y)
    this.stepSeedCount()
    this.animateGuiHappy()
    this.showToast(`🌱 SEMILLA ${this.level}/3`, 0xffd700)

    this.time.delayedCall(950, async () => {
      if (gen !== this.gen) return
      if (this.level < 3) {
        await this.transitionFlash()
        if (gen !== this.gen) return
        this.startLevel(this.level + 1, true)
      } else {
        this.finalVictory()
      }
    })
  }

  stepSeedCount() {
    if (this.seedsHudText) this.seedsHudText.setText(`SEMILLA: ${this.level}/3`)
  }

  burstParticles(x, y) {
    const sparks = this.textures.exists('spark')
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      const dist = Phaser.Math.Between(36, 84)
      const s = this.add.image(x, y, sparks ? 'spark' : 'firefly').setDepth(10).setScale(0.7).setTint(0xffd94a)
      this.tweens.add({ targets: s, x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist, alpha: 0, scale: 0.2, duration: Phaser.Math.Between(500, 800) })
      this.time.delayedCall(820, () => s.destroy())
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const p = this.add.image(x, y, 'petal').setDepth(10).setAlpha(1)
      this.tweens.add({ targets: p, x: x + Math.cos(a) * Phaser.Math.Between(20, 46), y: y + Math.sin(a) * Phaser.Math.Between(20, 46), rotation: Phaser.Math.Between(-4, 4), alpha: 0, duration: Phaser.Math.Between(600, 1000) })
      this.time.delayedCall(1000, () => p.destroy())
    }
  }

  animateGuiHappy() {
    const baseY = this.gui.y
    this.tweens.add({ targets: this.gui, y: baseY - 26, duration: 180, yoyo: true, repeat: 2 })
    const heart = this.textures.exists('heart')
    for (let i = 0; i < 4; i++) {
      const h = this.add.image(this.gui.x + Phaser.Math.Between(-16, 16), this.gui.y - 20, heart ? 'heart' : 'spark').setDepth(10).setScale(heart ? 0.5 : 0.7).setTint(0xff5f8a).setAlpha(0)
      this.tweens.add({ targets: h, y: h.y - Phaser.Math.Between(18, 34), alpha: { from: 0.9, to: 0 }, duration: 700 })
      this.time.delayedCall(760, () => h.destroy())
    }
  }

  async transitionFlash() {
    const fl = this.add.rectangle(480, 270, 960, 540, 0x000000, 0).setDepth(70)
    await new Promise((res) => {
      this.tweens.add({ targets: fl, alpha: { from: 0, to: 1 }, duration: 350, onComplete: () => res() })
    })
    fl.setAlpha(0)
    await new Promise((res) => {
      this.tweens.add({ targets: fl, alpha: { from: 1, to: 0 }, duration: 350, onComplete: () => { fl.destroy(); res() } })
    })
  }

  finalVictory() {
    sfx.win()
    const ec = centerOf(this.maze.exit)
    this.burstParticles(ec.x, ec.y)
    this.showToast('🌻 ¡TODAS LAS SEMILLAS! 🌻', 0xffd700)
    this.time.delayedCall(600, async () => {
      await this.dlg.say('¡Lo logramos, papá! 🌻 Guardé nuestras semillas. Pronto las plantaremos juntos en casa, cuando volvamos a nuestro jardín.', 'Gui', '#ffd700')
      await this.dlg.say('Mónica te espera con nuestro ramo de flores amarillas. Sus pétalos brillan igual que tus palabras, papá. 💛', 'Gui', '#ffd700')
      this.dlg.hide()
      bus.emit(GAME_EVENTS.MAZE_VICTORY)
    })
  }

  retryLevel() {
    this.startLevel(this.level, false)
  }

  waitPress() {
    return new Promise((res) => {
      const done = () => {
        this.input.off('pointerdown', done)
        this.input.keyboard.off('keydown-SPACE', done)
        this.input.keyboard.off('keydown-ENTER', done)
        res()
      }
      this.input.once('pointerdown', done)
      this.input.keyboard.once('keydown-SPACE', done)
      this.input.keyboard.once('keydown-ENTER', done)
    })
  }

  wait(ms) {
    return new Promise((res) => this.time.delayedCall(ms, res))
  }
}