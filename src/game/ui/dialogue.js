const FONT = '"Press Start 2P", "VT323", monospace'

export function attachDialogue(scene, opts = {}) {
  const cw = scene.scale.width
  const box = scene.add
    .rectangle(cw / 2, 478, 884, 122, 0x0d0514, 0.95)
    .setStrokeStyle(3, 0xffd700, 1)
    .setDepth(80)
    .setVisible(false)

  const nameText = scene.add
    .text(90, 432, '', { fontFamily: FONT, fontSize: '11px', color: '#ffd700' })
    .setDepth(81)
    .setVisible(false)

  const bodyText = scene.add
    .text(96, 456, '', {
      fontFamily: FONT,
      fontSize: '10px',
      color: '#f7f1e2',
      lineSpacing: 8,
      wordWrap: { width: 780 },
    })
    .setDepth(81)
    .setVisible(false)

  const hint = scene.add
    .text(cw - 106, 514, 'ESPACIO  ▼', {
      fontFamily: FONT,
      fontSize: '8px',
      color: '#e8c65a',
    })
    .setOrigin(1, 0.5)
    .setDepth(82)
    .setVisible(false)

  let resolveAdvance = null
  let typing = false
  let skipTyping = false

  function advance() {
    if (typing) {
      skipTyping = true
      return
    }
    if (resolveAdvance) {
      const r = resolveAdvance
      resolveAdvance = null
      hint.setVisible(false)
      r()
    }
  }

  const unadvance = scene.input.on('pointerdown', advance)
  const unspace = scene.input.keyboard.on('keydown-SPACE', advance)
  const unenter = scene.input.keyboard.on('keydown-ENTER', advance)
  const unesc = scene.input.keyboard.on('keydown-ESC', advance)
  const offs = [
    () => unadvance && unadvance.off && unadvance.off('pointerdown', advance),
    () => unspace && unspace.off && unspace.off('keydown-SPACE', advance),
    () => unenter && unenter.off && unenter.off('keydown-ENTER', advance),
    () => unesc && unesc.off && unesc.off('keydown-ESC', advance),
  ]

  async function waitForPress() {
    hint.setVisible(true)
    return new Promise((res) => {
      resolveAdvance = res
    })
  }

  async function typeText(text) {
    typing = true
    skipTyping = false
    bodyText.setText('')
    for (let i = 1; i <= text.length; i++) {
      if (skipTyping) break
      bodyText.setText(text.slice(0, i))
      await new Promise((res) => scene.time.delayedCall(14, res))
    }
    bodyText.setText(text)
    typing = false
  }

  async function say(name, text, color = '#ffd700') {
    box.setVisible(true)
    nameText.setVisible(true).setText(name).setColor(color)
    bodyText.setVisible(true)
    await typeText(text)
    await waitForPress()
  }

  function hide() {
    box.setVisible(false)
    nameText.setVisible(false)
    bodyText.setVisible(false)
    hint.setVisible(false)
    if (resolveAdvance) {
      resolveAdvance()
      resolveAdvance = null
    }
  }

  function isOpen() {
    return box.visible
  }

  scene.events.on('shutdown', () => offs.forEach((fn) => fn && fn()))

  return { say, hide, isOpen, box }
}