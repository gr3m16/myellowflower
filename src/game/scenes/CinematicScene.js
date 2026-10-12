import Phaser from 'phaser'
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config'
import { generateCharacterTextures } from '../utils/pixelArt'
import { generateBackgroundTextures } from '../utils/backgrounds'
import { bus, GAME_EVENTS } from '../bus'

const CX = DESIGN_WIDTH / 2
const CY = DESIGN_HEIGHT / 2

const FONT = '"Press Start 2P", "VT323", monospace'

const NEGATIVE_WORDS = [
  { text: 'CELOS', color: '#ff3b5c' },
  { text: 'FALTA DE COMUNICACIÓN', color: '#b14cff' },
  { text: 'IRRESPETO', color: '#5c8cff' },
  { text: 'RUTINA', color: '#ff3b5c' },
  { text: 'INDIFERENCIA', color: '#b14cff' },
  { text: 'ORGULLO', color: '#5c8cff' },
  { text: 'SUPOSICIONES', color: '#ff3b5c' },
]

const char = (scene, key, x, y, depth = 5) => {
  const spr = scene.add.image(x, y, key).setDepth(depth)
  return spr
}

export default class CinematicScene extends Phaser.Scene {
  constructor() {
    super('CinematicScene')
  }

  create() {
    this.negWords = []
    this.resolveAdvance = null
    this.typing = false
    this.skipTyping = false
    this.gameEnded = false

    generateCharacterTextures(this)
    generateBackgroundTextures(this)
    this.generateEffectTextures()

    this.buildDialogue()
    this.buildOverlays()

    this.input.on('pointerdown', this.advance, this)
    this.input.keyboard.on('keydown-SPACE', this.advance, this)
    this.input.keyboard.on('keydown-ENTER', this.advance, this)
    this.input.keyboard.on('keydown-ESC', this.advance, this)

    this.time.delayedCall(60, () => {
      Promise.resolve(document.fonts ? document.fonts.ready : 1).then(() => {
        bus.emit(GAME_EVENTS.GAME_READY)
        this.runCinematic()
      })
    })
  }

  generateEffectTextures() {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0xffd700, 0.9)
    g.fillTriangle(0, 0, 24, 0, 12, 64)
    g.generateTexture('beam', 24, 64)
    g.clear()

    for (let i = 0; i < 6; i++) {
      const a = 0.22 - i * 0.035
      g.fillStyle(0xffd700, a)
      g.fillCircle(32, 32, 30 - i * 5)
    }
    g.generateTexture('halo', 64, 64)
    g.clear()

    g.fillStyle(0xfff3c4, 1)
    g.fillRect(1, 1, 1, 1)
    g.fillRect(2, 2, 1, 1)
    g.generateTexture('spark', 3, 3)
    g.destroy()
  }

  buildDialogue() {
    this.dlgBox = this.add
      .rectangle(CX, 478, 884, 122, 0x0d0514, 0.95)
      .setStrokeStyle(3, 0xffd700, 1)
      .setDepth(80)
      .setVisible(false)

    this.dlgName = this.add
      .text(90, 432, '', {
        fontFamily: FONT,
        fontSize: '11px',
        color: '#ffd700',
      })
      .setDepth(81)
      .setVisible(false)

    this.dlgText = this.add
      .text(96, 456, '', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#f7f1e2',
        lineSpacing: 8,
        wordWrap: { width: 780 },
      })
      .setDepth(81)
      .setVisible(false)

    this.dlgHint = this.add
      .text(854, 514, 'ESPACIO  ▼', {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#e8c65a',
      })
      .setOrigin(1, 0.5)
      .setDepth(82)
      .setVisible(false)
  }

  buildOverlays() {
    this.titleText = this.add
      .text(CX, 64, '', {
        fontFamily: FONT,
        fontSize: '22px',
        color: '#ffd700',
      })
      .setOrigin(0.5)
      .setDepth(60)
      .setVisible(false)

    this.vignette = this.add
      .rectangle(CX, CY, DESIGN_WIDTH, DESIGN_HEIGHT, 0x05020c, 0)
      .setDepth(55)
      .setVisible(false)

    this.flashRect = this.add
      .rectangle(CX, CY, DESIGN_WIDTH, DESIGN_HEIGHT, 0xffffff, 0)
      .setDepth(70)
      .setVisible(false)

    this.redRect = this.add
      .rectangle(CX, CY, DESIGN_WIDTH, DESIGN_HEIGHT, 0xff1f4d, 0)
      .setDepth(70)
      .setVisible(false)
  }

  style(size, color, extra = {}) {
    return Object.assign(
      {
        fontFamily: FONT,
        fontSize: `${size}px`,
        color,
      },
      extra
    )
  }

  delay(ms) {
    return new Promise((res) => this.time.delayedCall(ms, res))
  }

  advance() {
    if (this.gameEnded) return
    if (this.typing) {
      this.skipTyping = true
      return
    }
    if (this.resolveAdvance) {
      const r = this.resolveAdvance
      this.resolveAdvance = null
      this.dlgHint.setVisible(false)
      r()
    }
  }

  async waitForPress() {
    if (this.gameEnded) return
    this.dlgHint.setVisible(true)
    return new Promise((res) => {
      this.resolveAdvance = res
    })
  }

  async typeText(full) {
    this.typing = true
    this.skipTyping = false
    this.dlgText.setText('')
    for (let i = 1; i <= full.length; i++) {
      if (this.skipTyping) break
      this.dlgText.setText(full.slice(0, i))
      await this.delay(14)
    }
    this.dlgText.setText(full)
    this.typing = false
  }

  async dialogue(name, text, color = '#ffd700') {
    this.dlgBox.setVisible(true)
    this.dlgName.setVisible(true).setText(name).setColor(color)
    this.dlgText.setVisible(true)
    await this.typeText(text)
    await this.waitForPress()
    this.dlgBox.setVisible(false)
    this.dlgName.setVisible(false)
    this.dlgText.setVisible(false)
    this.dlgHint.setVisible(false)
  }

  async title(x) {
    this.titleText.setText(x).setVisible(true).setAlpha(0.85)
    this.tweens.add({ targets: this.titleText, alpha: { from: 0, to: 1 }, duration: 400 })
    await this.delay(1500)
    this.tweens.add({ targets: this.titleText, alpha: 0, duration: 500 })
    await this.delay(500)
    this.titleText.setVisible(false)
  }

  flash(color, alphaMax, dur = 500, fadeDur = 400) {
    const r = color === 'red' ? this.redRect : this.flashRect
    r.setVisible(true).setAlpha(alphaMax)
    this.tweens.add({
      targets: r,
      alpha: { from: alphaMax, to: 0 },
      duration: dur + fadeDur,
      onComplete: () => r.setVisible(false),
    })
  }

  async darken(to = 0.75, dur = 800) {
    this.vignette.setVisible(true)
    return new Promise((res) => {
      this.tweens.add({
        targets: this.vignette,
        alpha: { to },
        duration: dur,
        ease: 'Sine.easeInOut',
        onComplete: res,
      })
    })
  }

  async lighten(to = 0, dur = 800) {
    return new Promise((res) => {
      this.tweens.add({
        targets: this.vignette,
        alpha: { to },
        duration: dur,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (to === 0) this.vignette.setVisible(false)
          res()
        },
      })
    })
  }

  async panTo(x, y, dur = 1100) {
    const cam = this.cameras.main
    return new Promise((res) => {
      let done = false
      const finish = () => {
        if (!done) {
          done = true
          res()
        }
      }
      cam.once('camerapancomplete', finish)
      if (Math.abs(cam.midPoint.x - x) < 2 && Math.abs(cam.midPoint.y - y) < 2) {
        finish()
      } else {
        cam.pan(x, y, dur, 'Sine.easeInOut')
        this.time.delayedCall(dur + 80, finish)
      }
    })
  }

  async zoomTo(z, dur = 1400) {
    const cam = this.cameras.main
    return new Promise((res) => {
      let done = false
      const finish = () => {
        if (!done) {
          done = true
          res()
        }
      }
      cam.once('camerazoomcomplete', finish)
      if (Math.abs(cam.zoom - z) < 0.02) {
        finish()
      } else {
        cam.zoomTo(z, dur, 'Sine.easeInOut')
        this.time.delayedCall(dur + 80, finish)
      }
    })
  }

  shake(dur = 500, intensity = 0.01) {
    this.cameras.main.shake(dur, intensity)
  }

  resetCamera() {
    const cam = this.cameras.main
    cam.setZoom(1)
    cam.setScroll(0, 0)
    cam.stopFollow()
  }

  spawnVine(x, y, rotation = 0, scale = 1, depth = 4) {
    const v = this.add.image(x, y, 'cizana_vine').setDepth(depth).setOrigin(0.5, 1)
    v.setRotation(rotation + Phaser.Math.FloatBetween(-0.1, 0.1))
    v.setScale(scale * 0.6)
    this.tweens.add({
      targets: v,
      scaleX: scale * Phaser.Math.FloatBetween(0.9, 1.15),
      scaleY: scale,
      duration: Phaser.Math.Between(500, 900),
      ease: 'Back.out',
    })
    return v
  }

  sparkle(x, y, amount = 10, color = 0xffd700) {
    for (let i = 0; i < amount; i++) {
      const s = this.add.image(x, y, 'spark').setDepth(64)
      s.setTint(color)
      this.tweens.add({
        targets: s,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-50, 10),
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(700, 1400),
        ease: 'Sine.out',
        onComplete: () => s.destroy(),
      })
    }
  }

  async floatNegativeWords() {
    await this.darken(0.88, 700)
    const words = []
    NEGATIVE_WORDS.forEach((w, i) => {
      const t = this.add
        .text(
          Phaser.Math.Between(60, DESIGN_WIDTH - 60),
          Phaser.Math.Between(110, 400),
          w.text,
          this.style(11, w.color)
        )
        .setOrigin(0.5)
        .setDepth(58)
        .setAlpha(0)
      words.push({ go: t, base: Phaser.Math.Between(0.6, 1) })
    })
    words.forEach((o) => {
      this.tweens.add({ targets: o.go, alpha: o.base, duration: 400 })
      const dur = Phaser.Math.Between(2600, 4200)
      this.tweens.add({
        targets: o.go,
        x: Phaser.Math.Between(50, DESIGN_WIDTH - 50),
        y: Phaser.Math.Between(100, 410),
        angle: Phaser.Math.Between(-8, 8),
        duration: dur,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 800),
      })
    })
    this.negWords = words
    await this.delay(1100)
  }

  async clearNegativeWords() {
    await Promise.all(
      this.negWords.map(
        (o) =>
          new Promise((res) => {
            this.tweens.add({
              targets: o.go,
              alpha: 0,
              scale: 0.8,
              duration: 350,
              onComplete: () => o.go.destroy(),
            })
            this.time.delayedCall(360, res)
          })
      )
    )
    this.negWords = []
    await this.lighten(0, 500)
  }

  runCinematic() {
    this.runSceneA()
      .then(() => this.runSceneB())
      .then(() => this.runSceneC())
      .then(() => this.runSceneD())
      .catch((err) => {
        console.error('Cinemática interrumpida:', err)
      })
  }

  clearOver() {
    this.dlgBox.setVisible(false)
    this.dlgName.setVisible(false)
    this.dlgText.setVisible(false)
    this.dlgHint.setVisible(false)
    this.titleText.setVisible(false)
  }

  async runSceneA() {
    this.add.image(CX, CY, 'bg_a').setDepth(0)
    this.add
      .rectangle(CX, CY, DESIGN_WIDTH, DESIGN_HEIGHT, 0xffe9a8, 0.16)
      .setDepth(1)
      .setBlendMode(Phaser.BlendModes.ADD)

    this.monica = char(this, 'monica', 300, 318, 5)
    this.monica.setScale(0.9)
    this.padre = char(this, 'padre', 636, 320, 5)
    this.padre.setScale(0.95)
    this.gui = char(this, 'gui', 452, 322, 6)
    this.gui.setScale(0.8)

    const mk = (key, x, y, d = 7) => char(this, key, x, y, d)
    const p1 = mk('plate', 300, 436)
    const p2 = mk('plate', 452, 440)
    const p3 = mk('plate', 636, 434)
    mk('food', 300, 433)
    mk('food', 452, 437)
    mk('food', 636, 431)
    mk('cup', 356, 436)
    mk('cup', 516, 440)
    mk('cup', 690, 434)

    this.tableStuff = [p1, p2, p3]

    this.title('EL ALMUERZO DE LA FAMILIA')
    await this.delay(900)

    await this.dialogue('Narrador', 'Un 21 de septiembre, el Día de las Flores Amarillas, todo comienza con un almuerzo en familia.', '#ffd700')
    await this.dialogue('Mónica', '¡Qué delicioso almuerzo, mi amor! Gracias por cocinar.', '#ff8f9e')
    await this.dialogue('Gui', '¡Papá! ¡Mamá! Ayer sembramos una semilla... ¡como en un cuento!', '#ffd700')
    await this.dialogue('Papá', 'Así es, hijo. Mónica, tú eres la luz que ilumina esta casa.', '#b8d8ff')
    await this.dialogue('Narrador', 'Un instante de paz y felicidad. Pero de pronto... un escalofrío recorre el aire cálido del hogar.', '#ffd700')
    await this.dialogue('Papá', 'Mónica... siento un mal presentimiento. Como si algo muy oscuro se acercara.', '#b8d8ff')
    await this.dialogue('Mónica', 'Yo también lo siento, mi amor... Nuestro hogar empieza a temblar.', '#ff8f9e')

    await this.darken(0.5, 1100)
    this.monica.setTint(0x9a7a9a)
    this.padre.setTint(0x9a7a9a)
    this.gui.setTint(0x9a7a9a)
  }

  async runSceneB() {
    this.shake(700, 0.012)
    this.flash('red', 0.35, 400)
    const cast = this.add.image(CX, CY, 'bg_cast').setDepth(2).setAlpha(0)
    this.tweens.add({ targets: cast, alpha: 1, duration: 900 })

    this.title('¡EL ATAQUE DE LA CIZAÑA!')
    for (const t of this.tableStuff) {
      this.tweens.add({
        targets: t,
        y: t.y - Phaser.Math.Between(30, 90),
        alpha: 0,
        angle: Phaser.Math.Between(-40, 40),
        duration: Phaser.Math.Between(500, 900),
        ease: 'Back.in',
      })
    }

    this.spawnVine(120, CY, -0.5, 1.6, 3)
    this.spawnVine(860, CY, 0.5, 1.9, 3)
    this.spawnVine(480, CY, 0, 1.4, 3)
    this.spawnVine(200, 300, -1.0, 1.5, 3)
    this.spawnVine(760, 300, 1.0, 1.5, 3)
    this.spawnVine(340, 520, -0.2, 1.3, 3)
    this.spawnVine(620, 520, 0.2, 1.4, 3)
    await this.delay(800)

    await this.dialogue('Narrador', '¡La Cizaña! Plantas malignas y espinosas brotan del suelo y las paredes, devorando el hogar.', '#ff8f6e')
    const m1 = this.spawnVine(300, 360, -1.35, 1.5, 8)
    const m2 = this.spawnVine(300, 430, 1.35, 1.4, 8)
    await this.delay(250)

    await this.dialogue('Mónica', '¡Nooo! ¡Suéltenme... Gui! ¡Ayúdenme!', '#ff6b7a')
    this.shake(550, 0.008)
    this.tweens.add({
      targets: this.monica,
      x: 120,
      y: -160,
      rotation: 0.6,
      duration: 1100,
      ease: 'Sine.easeIn',
    })
    m1.scaleY = 0.9
    m1.scaleX = 0.7
    this.tweens.add({ targets: m1, x: 60, y: -140, rotation: -0.4, duration: 1000 })
    this.tweens.add({ targets: m2, x: 140, y: -80, rotation: 0.4, duration: 1000 })
    await this.delay(1300)
    this.monica.setVisible(false)
    m1.setVisible(false)
    m2.setVisible(false)

    await this.darken(0.82, 600)
    await this.dialogue('Narrador', 'Las espinas atrapan a Mónica y la arrastran a la oscuridad. Entonces, entre las sombras, una forma terrible toma vida...', '#ff8f6e')
  }

  async runSceneC() {
    const bgc = this.add.image(CX, CY, 'bg_c').setDepth(0).setAlpha(0)
    this.tweens.add({ targets: bgc, alpha: 1, duration: 600 })

    const vine = this.add.image(CX, 430, 'cizana_vine').setDepth(3).setAlpha(0).setScale(1.6)
    this.tweens.add({ targets: vine, alpha: 1, duration: 400, yoyo: true, repeat: 1 })
    await this.delay(900)
    vine.destroy()

    this.flash('red', 0.4, 300)
    this.cizana = this.add.image(500, 350, 'cizana_humano').setDepth(4).setScale(0.1)
    this.tweens.add({ targets: this.cizana, scale: 1.5, duration: 900, ease: 'Back.out' })
    await this.darken(0.9, 700)

    this.title('LA CIZAÑA HUMANA')
    await this.delay(300)

    await this.dialogue('Papá', '¿Qué eres tú? ¡Devuélvenos a Mónica!', '#b8d8ff')
    await this.dialogue('La Cizaña', 'Soy todo lo que los destruye.', '#ff4bd6')

    await this.zoomTo(2.4, 1500)
    await this.panTo(500, 258, 1000)
    this.cizana.setAlpha(0)
    this.flash('red', 0.3, 300)
    const eyes = this.add.image(500, 258, 'cizana_eyes').setDepth(6).setScale(0.01)
    this.tweens.add({
      targets: eyes,
      scale: 3.4,
      duration: 900,
      ease: 'Back.out',
    })
    this.tweens.add({
      targets: eyes,
      scaleX: 3.4,
      scaleY: 3.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    await this.delay(1200)
    await this.zoomTo(1, 1200)
    await this.panTo(CX, CY, 900)

    await this.dialogue('Narrador', 'Mira a los ojos de la Cizaña... En ellos habita todo lo que lastima el amor.', '#ff8f6e')
    await this.floatNegativeWords()
    await this.dialogue('Narrador', 'Celos... Falta de comunicación... Irrespeto... Rutina...', '#ff8f6e')
    await this.dialogue('Narrador', '¡El orgullo, la indiferencia y las suposiciones pretenden devorarlo todo!', '#ff8f6e')

    this.tweens.add({
      targets: eyes,
      alpha: 0,
      duration: 400,
      onComplete: () => eyes.destroy(),
    })
    await this.clearNegativeWords()
  }

  async runSceneD() {
    await this.resetSceneForD()

    this.padreBlue = char(this, 'padre', 300, 340, 5)
    this.padreBlue.setScale(0.85)
    this.guiBlue = char(this, 'gui', 200, 352, 6)
    this.guiBlue.setScale(0.7)
    this.padreBlue.setTint(0x5a5278)
    this.guiBlue.setTint(0x5a5278)
    this.guiBlue.setAngle(-12)
    const t1 = char(this, 'tear', 196, 340, 8)
    const t2 = char(this, 'tear', 202, 336, 8)

    this.title('LA LUZ DIVINA')

    await this.dialogue('Papá', 'Gui... hijo mío... No sé qué hacer para salvar a mamá.', '#b8d8ff')
    await this.dialogue('Gui', 'Papi... tengo miedo... Quiero que mamá vuelva a casa.', '#ffd700')
    await this.delay(500)

    const beam = this.add.image(CX, 20, 'beam').setDepth(6).setOrigin(0.5, 0)
    beam.setScale(1, 5.6)
    beam.setBlendMode(Phaser.BlendModes.ADD)
    beam.setAlpha(0)
    this.tweens.add({ targets: beam, alpha: 0.75, duration: 800 })
    this.sparkle(CX, 160, 26)
    this.flash(0xfff3c4, 0.55, 600, 500)

    await this.dialogue('Narrador', 'De pronto, una luz divina desciende desde el cielo, iluminando al pequeño Gui.', '#a8e6ff')

    this.halo = this.add.image(200, 352, 'halo').setDepth(7).setScale(2.6)
    this.halo.setBlendMode(Phaser.BlendModes.ADD)
    this.halo.setAlpha(0)
    this.tweens.add({ targets: this.halo, alpha: 0.9, duration: 800 })
    this.tweens.add({ targets: this.halo, scale: { from: 2.2, to: 2.8 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.guiBlue.setTint(0xfff7c0)
    this.eyeL = this.add.circle(192, 332, 7, 0xfff3c4).setDepth(9).setBlendMode(Phaser.BlendModes.ADD)
    this.eyeR = this.add.circle(208, 332, 7, 0xfff3c4).setDepth(9).setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: [this.eyeL, this.eyeR], scale: { from: 0.6, to: 1.4 }, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.tweens.add({ targets: this.guiBlue, y: 342, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    await this.dialogue('Gui (Guía Divino)', 'La única forma de resolver esto y salvar a mamá es cultivando nuestro amor. Debes encontrar las 3 Semillas del Amor.', '#ffe680')
    await this.dialogue('Gui (Guía Divino)', 'La Semilla de la Empatía y la Comunicación vence la falta de comunicación y el orgullo.', '#ffd54f')
    await this.dialogue('Gui (Guía Divino)', 'La Semilla de la Confianza Inquebrantable derrota los celos y las suposiciones.', '#81d4fa')
    await this.dialogue('Gui (Guía Divino)', 'Y la Semilla de la Admiración y el Cuidado vence el irrespeto, la rutina y la indiferencia.', '#ffb74d')

    await this.showSeeds()

    await this.dialogue('Gui (Guía Divino)', 'Yo permaneceré a tu lado, guiándote. Cultiva cada semilla y el amor volverá a florecer.', '#ffe680')
    await this.dialogue('Narrador', 'Gui permanece iluminado como tu guía divino en el cielo estrellado. El viaje del amor ha comenzado.', '#ffd700')

    this.finishCinematic()
  }

  async resetSceneForD() {
    this.padre?.destroy()
    this.gui?.destroy()
    this.monica?.destroy()
    this.cizana?.destroy()
    this.dlgHint.setVisible(false)
    this.vignette.setVisible(false).setAlpha(0)
    const sky = this.add.image(CX, CY, 'bg_d').setDepth(0).setAlpha(0)
    this.tweens.add({ targets: sky, alpha: 1, duration: 500 })
    this.add.image(CX, 50, 'halo').setDepth(1).setScale(4)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.25)
    await this.delay(600)
  }

  async showSeeds() {
    const seeds = [
      { key: 'seed_empatia', label: 'EMPATÍA Y COMUNICACIÓN', sub: 'contra el orgullo' },
      { key: 'seed_confianza', label: 'CONFIANZA INQUEBRANTABLE', sub: 'contra los celos' },
      { key: 'seed_admiracion', label: 'ADMIRACIÓN Y CUIDADO', sub: 'contra el irrespeto' },
    ]
    const xs = [300, 480, 660]
    for (let i = 0; i < seeds.length; i++) {
      const x = xs[i]
      const seed = this.add.image(x, 90, seeds[i].key).setDepth(12).setScale(0.5).setAlpha(0)
      this.tweens.add({ targets: seed, scale: 1.1, alpha: 1, duration: 500, ease: 'Back.out' })
      this.tweens.add({ targets: seed, y: 78, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 200 })
      const halo = this.add.image(x, 84, 'halo').setDepth(11).setScale(1.4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0)
      this.tweens.add({ targets: halo, alpha: 0.6, duration: 500 })
      this.sparkle(x, 70, 6)
      this.add
        .text(x, 150, seeds[i].label, this.style(10, '#ffd700'))
        .setOrigin(0.5)
        .setDepth(13)
      this.add
        .text(x, 176, seeds[i].sub, this.style(8, '#f7f1e2'))
        .setOrigin(0.5)
        .setDepth(13)
      await this.delay(250)
    }
    await this.delay(800)
  }

  async finishCinematic() {
    this.gameEnded = true
    this.clearOver()
    this.cameras.main.fadeOut(800, 12, 6, 40)
    bus.emit(GAME_EVENTS.CINEMATIC_END)
    this.time.delayedCall(850, () => {
      this.tweens.killAll()
      this.game.scene.stop('CinematicScene')
    })
  }
}