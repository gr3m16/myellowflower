const C = {
  gold: 0xffd700,
  goldBright: 0xffe34c,
  skinMonica: 0xf2c79b,
  skinMonicaDark: 0xe3b182,
  hairMonica: 0xc2563c,
  hairMonicaLight: 0xe08a56,
  plaidRed: 0xb03a2e,
  plaidDark: 0x71281f,
  plaidBlack: 0x1a0f0c,
  hand: 0xf0bd8f,
  skinPadre: 0xdcae83,
  skinPadreDark: 0xc89a6f,
  hairPadre: 0x2c1c13,
  beardPadre: 0x3a291e,
  blackShirt: 0x1d1b1e,
  blackShirtLight: 0x2b2830,
  skinEd: 0xf6d0a8,
  hairEd: 0x35241c,
  sweaterEd: 0xc62f2f,
  sweaterDark: 0x9e2626,
  cizanaDark: 0x1a0d2e,
  cizanaPurple: 0x5a1f86,
  cizanaMist: 0x8a3ac7,
  cizanaEye: 0xff2bd6,
  cizanaEyeHot: 0xff9df0,
  vineDark: 0x2b1347,
  vineMid: 0x4b1b6b,
  vineLight: 0x7a2ea8,
  fleshVine: 0x9b4bc4,
  white: 0xffffff,
  cream: 0xf7f1e2,
  morning: 0xfff3c4,
  skyBlue: 0xbfdcef,
}

export function px(g, x, y, s, color) {
  g.fillStyle(color, 1)
  g.fillRect(x * s, y * s, s, s)
}

export function rect(g, x, y, w, h, s, color) {
  g.fillStyle(color, 1)
  g.fillRect(x * s, y * s, w * s, h * s)
}

function makeTexture(scene, key, gw, gh, s, draw) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  draw(g, s, gw, gh)
  g.generateTexture(key, gw * s, gh * s)
  g.destroy()
}

export function generateCharacterTextures(scene) {
  const s = 4

  makeTexture(scene, 'monica', 24, 32, s, (g) => {
    rect(g, 4, 0, 16, 4, s, C.hairMonica)
    rect(g, 3, 1, 18, 5, s, C.hairMonica)
    rect(g, 2, 3, 2, 12, s, C.hairMonica)
    rect(g, 20, 3, 2, 12, s, C.hairMonica)
    px(g, 2, 14, s, C.hairMonica)
    px(g, 21, 14, s, C.hairMonica)
    rect(g, 3, 16, 2, 20, s, C.hairMonica)
    px(g, 2, 17, s, C.hairMonica)
    rect(g, 19, 16, 2, 20, s, C.hairMonica)
    px(g, 21, 17, s, C.hairMonica)
    rect(g, 4, 5, 16, 9, s, C.skinMonica)
    rect(g, 4, 5, 16, 3, s, C.hairMonicaLight)
    px(g, 4, 4, s, C.hairMonicaLight)
    px(g, 19, 4, s, C.hairMonicaLight)
    px(g, 9, 9, s, 0x3a2f2b)
    px(g, 14, 9, s, 0x3a2f2b)
    px(g, 8, 10, s, 0xd78f8f)
    px(g, 15, 10, s, 0xd78f8f)
    rect(g, 10, 11, 4, 1, s, 0x8c2f2f)
    rect(g, 8, 12, 2, 3, s, C.skinMonica)
    rect(g, 14, 12, 2, 3, s, C.skinMonica)
    rect(g, 7, 13, 10, 2, s, C.skinMonica)
    rect(g, 6, 13, 12, 17, s, C.plaidRed)
    rect(g, 6, 13, 12, 5, s, C.plaidDark)
    rect(g, 8, 18, 1, 12, s, C.plaidBlack)
    rect(g, 12, 18, 1, 12, s, C.plaidBlack)
    rect(g, 16, 18, 1, 12, s, C.plaidBlack)
    px(g, 7, 20, s, C.plaidDark)
    px(g, 9, 20, s, C.plaidDark)
    px(g, 10, 21, s, C.plaidDark)
    px(g, 13, 20, s, C.plaidDark)
    px(g, 14, 21, s, C.plaidDark)
    px(g, 11, 23, s, C.plaidDark)
    px(g, 15, 23, s, C.plaidDark)
    px(g, 7, 26, s, C.plaidDark)
    px(g, 9, 26, s, C.plaidDark)
    px(g, 10, 27, s, C.plaidDark)
    px(g, 13, 26, s, C.plaidDark)
    px(g, 14, 27, s, C.plaidDark)
    rect(g, 3, 15, 3, 9, s, C.plaidRed)
    rect(g, 18, 15, 3, 9, s, C.plaidRed)
    rect(g, 3, 24, 3, 2, s, C.hand)
    rect(g, 18, 24, 3, 2, s, C.hand)
    px(g, 12, 12, s, C.gold)
    px(g, 11, 13, s, C.gold)
    px(g, 13, 13, s, C.gold)
  })

  makeTexture(scene, 'padre', 24, 34, s, (g) => {
    rect(g, 5, 0, 14, 3, s, C.hairPadre)
    rect(g, 3, 1, 18, 5, s, C.hairPadre)
    rect(g, 2, 4, 2, 10, s, C.hairPadre)
    rect(g, 20, 4, 2, 10, s, C.hairPadre)
    rect(g, 5, 4, 14, 6, s, C.skinPadre)
    rect(g, 5, 4, 14, 2, s, C.hairPadre)
    rect(g, 4, 8, 16, 6, s, C.beardPadre)
    px(g, 8, 8, s, 0x241a12)
    px(g, 15, 8, s, 0x241a12)
    px(g, 9, 9, s, 0x221812)
    px(g, 14, 9, s, 0x221812)
    rect(g, 10, 9, 4, 1, s, 0x6b4a35)
    rect(g, 5, 14, 2, 3, s, C.skinPadre)
    rect(g, 17, 14, 2, 3, s, C.skinPadre)
    rect(g, 4, 16, 16, 2, s, C.skinPadre)
    rect(g, 4, 17, 16, 17, s, C.blackShirt)
    rect(g, 4, 17, 16, 3, s, C.blackShirtLight)
    rect(g, 2, 18, 2, 12, s, C.blackShirt)
    rect(g, 20, 18, 2, 12, s, C.blackShirt)
    rect(g, 2, 30, 2, 2, s, C.skinPadreDark)
    rect(g, 20, 30, 2, 2, s, C.skinPadreDark)
    rect(g, 9, 18, 6, 1, s, 0x9a9aa0)
    px(g, 10, 31, s, 0x0d0b10)
    px(g, 13, 31, s, 0x0d0b10)
  })

  makeTexture(scene, 'gui', 18, 24, s, (g) => {
    rect(g, 5, 0, 8, 3, s, C.hairEd)
    rect(g, 4, 1, 10, 4, s, C.hairEd)
    rect(g, 3, 3, 2, 7, s, C.hairEd)
    rect(g, 13, 3, 2, 7, s, C.hairEd)
    rect(g, 5, 4, 8, 5, s, C.skinEd)
    rect(g, 7, 7, 1, 1, s, 0x42332b)
    rect(g, 10, 7, 1, 1, s, 0x42332b)
    rect(g, 8, 8, 2, 1, s, 0xa85555)
    rect(g, 6, 9, 1, 2, s, C.skinEd)
    rect(g, 11, 9, 1, 2, s, C.skinEd)
    rect(g, 5, 10, 8, 2, s, C.skinEd)
    rect(g, 4, 11, 10, 13, s, C.sweaterEd)
    rect(g, 5, 11, 8, 2, s, C.sweaterDark)
    rect(g, 3, 13, 2, 8, s, C.sweaterEd)
    rect(g, 13, 13, 2, 8, s, C.sweaterEd)
    rect(g, 3, 21, 2, 2, s, C.skinEd)
    rect(g, 13, 21, 2, 2, s, C.skinEd)
    px(g, 4, 12, s, 0xffffff)
    px(g, 13, 12, s, 0xffffff)
  })

  makeTexture(scene, 'cizana_humano', 22, 44, s, (g) => {
    rect(g, 9, 0, 4, 3, s, C.cizanaDark)
    px(g, 7, 1, s, C.cizanaDark)
    px(g, 14, 1, s, C.cizanaDark)
    px(g, 6, 2, s, C.cizanaDark)
    px(g, 15, 2, s, C.cizanaDark)
    rect(g, 6, 3, 10, 8, s, C.cizanaDark)
    rect(g, 6, 3, 10, 3, s, C.cizanaPurple)
    px(g, 8, 5, s, C.cizanaEye)
    px(g, 13, 5, s, C.cizanaEye)
    px(g, 8, 6, s, C.cizanaEyeHot)
    px(g, 13, 6, s, C.cizanaEyeHot)
    rect(g, 9, 8, 4, 1, s, C.cizanaEyeHot)
    rect(g, 8, 11, 1, 3, s, C.cizanaDark)
    rect(g, 13, 11, 1, 3, s, C.cizanaDark)
    rect(g, 4, 14, 14, 24, s, C.cizanaDark)
    px(g, 3, 15, s, C.cizanaPurple)
    px(g, 18, 15, s, C.cizanaPurple)
    px(g, 2, 18, s, C.cizanaPurple)
    px(g, 19, 18, s, C.cizanaPurple)
    px(g, 3, 22, s, C.cizanaPurple)
    px(g, 18, 22, s, C.cizanaPurple)
    px(g, 7, 17, s, C.cizanaPurple)
    px(g, 14, 17, s, C.cizanaPurple)
    px(g, 6, 24, s, C.cizanaPurple)
    px(g, 15, 24, s, C.cizanaPurple)
    px(g, 8, 27, s, C.cizanaPurple)
    px(g, 13, 27, s, C.cizanaPurple)
    rect(g, 0, 20, 3, 2, s, C.cizanaDark)
    rect(g, 19, 20, 3, 2, s, C.cizanaDark)
    px(g, 0, 21, s, C.cizanaPurple)
    rect(g, 9, 38, 4, 3, s, C.cizanaDark)
    px(g, 8, 38, s, C.cizanaDark)
    px(g, 13, 38, s, C.cizanaDark)
    rect(g, 5, 40, 12, 4, s, C.cizanaDark)
    px(g, 6, 41, s, C.cizanaPurple)
    px(g, 15, 41, s, C.cizanaPurple)
  })

  makeTexture(scene, 'cizana_eyes', 32, 20, s, (g) => {
    rect(g, 0, 0, 32, 20, s, 0x070310)
    rect(g, 2, 4, 11, 10, s, C.cizanaPurple)
    rect(g, 19, 4, 11, 10, s, C.cizanaPurple)
    rect(g, 3, 5, 9, 8, s, C.cizanaEye)
    rect(g, 20, 5, 9, 8, s, C.cizanaEye)
    rect(g, 5, 6, 5, 6, s, C.cizanaEyeHot)
    rect(g, 22, 6, 5, 6, s, C.cizanaEyeHot)
    px(g, 7, 8, s, 0xffffff)
    px(g, 24, 8, s, 0xffffff)
    px(g, 1, 6, s, C.cizanaMist)
    px(g, 30, 6, s, C.cizanaMist)
    px(g, 0, 12, s, C.cizanaMist)
    px(g, 31, 12, s, C.cizanaMist)
  })

  makeTexture(scene, 'cizana_vine', 24, 64, s, (g) => {
    rect(g, 8, 0, 8, 64, s, C.vineDark)
    px(g, 6, 2, s, C.vineMid)
    px(g, 16, 3, s, C.vineMid)
    px(g, 4, 8, s, C.vineLight)
    px(g, 17, 9, s, C.vineLight)
    px(g, 5, 14, s, C.vineMid)
    px(g, 18, 15, s, C.vineMid)
    px(g, 3, 20, s, C.vineLight)
    px(g, 19, 21, s, C.vineLight)
    px(g, 4, 26, s, C.vineMid)
    px(g, 17, 27, s, C.vineMid)
    px(g, 6, 32, s, C.vineLight)
    px(g, 18, 33, s, C.vineLight)
    px(g, 5, 38, s, C.vineMid)
    px(g, 16, 39, s, C.vineMid)
    px(g, 4, 44, s, C.vineLight)
    px(g, 19, 45, s, C.vineLight)
    px(g, 6, 50, s, C.vineMid)
    px(g, 17, 51, s, C.vineMid)
    px(g, 5, 56, s, C.vineLight)
    px(g, 18, 57, s, C.vineLight)
    px(g, 0, 10, s, C.cizanaDark)
    px(g, 2, 11, s, C.cizanaPurple)
    px(g, 21, 16, s, C.cizanaDark)
    px(g, 22, 17, s, C.cizanaPurple)
    px(g, 1, 30, s, C.cizanaDark)
    px(g, 3, 31, s, C.cizanaPurple)
    px(g, 20, 42, s, C.cizanaDark)
    px(g, 22, 43, s, C.cizanaPurple)
    px(g, 2, 55, s, C.cizanaDark)
    px(g, 4, 56, s, C.cizanaPurple)
    px(g, 21, 58, s, C.cizanaDark)
    px(g, 23, 59, s, C.cizanaPurple)
  })

  makeTexture(scene, 'seed_empatia', 12, 12, s, (g) => {
    rect(g, 3, 1, 6, 2, s, C.gold)
    rect(g, 2, 3, 8, 2, s, 0xff5c8a)
    rect(g, 1, 5, 10, 2, s, 0xff2d70)
    rect(g, 2, 7, 8, 2, s, 0xff5c8a)
    rect(g, 3, 9, 6, 2, s, C.gold)
    px(g, 5, 2, s, 0xffffff)
    px(g, 6, 6, s, 0xffffff)
  })

  makeTexture(scene, 'seed_confianza', 12, 12, s, (g) => {
    rect(g, 3, 1, 6, 2, s, C.gold)
    rect(g, 2, 3, 8, 2, s, 0x4fc3f7)
    rect(g, 1, 5, 10, 2, s, 0x29b6f6)
    rect(g, 2, 7, 8, 2, s, 0x4fc3f7)
    rect(g, 3, 9, 6, 2, s, C.gold)
    px(g, 5, 2, s, 0xffffff)
    px(g, 6, 6, s, 0xffffff)
  })

  makeTexture(scene, 'seed_admiracion', 12, 12, s, (g) => {
    rect(g, 3, 1, 6, 2, s, C.gold)
    rect(g, 2, 3, 8, 2, s, 0xffd54f)
    rect(g, 1, 5, 10, 2, s, 0xffb300)
    rect(g, 2, 7, 8, 2, s, 0xffd54f)
    rect(g, 3, 9, 6, 2, s, C.gold)
    px(g, 5, 2, s, 0xffffff)
    px(g, 6, 6, s, 0xffffff)
  })

  makeTexture(scene, 'plate', 12, 2, s, (g) => {
    rect(g, 1, 0, 10, 1, s, 0xffffff)
    px(g, 0, 0, s, 0xd9d9d9)
    px(g, 11, 0, s, 0xd9d9d9)
    rect(g, 0, 1, 12, 1, s, 0x242024)
  })

  makeTexture(scene, 'food', 6, 2, s, (g) => {
    px(g, 1, 0, s, 0xc8a04e)
    px(g, 3, 0, s, 0x7cb342)
    px(g, 5, 0, s, 0xc8a04e)
    px(g, 0, 1, s, 0x8d6e2f)
    px(g, 2, 1, s, 0x7cb342)
    px(g, 4, 1, s, 0x8d6e2f)
  })

  makeTexture(scene, 'cup', 3, 3, s, (g) => {
    px(g, 0, 0, s, 0x9c6b3c)
    px(g, 1, 0, s, 0x5a3518)
    px(g, 2, 0, s, 0x9c6b3c)
    rect(g, 0, 1, 3, 2, s, 0x9c6b3c)
  })

  makeTexture(scene, 'tear', 2, 2, s, (g) => {
    px(g, 0, 1, s, 0x8fc7e8)
    px(g, 1, 1, s, 0x6fb3dd)
    px(g, 1, 0, s, 0x8fc7e8)
  })
}

export { makeTexture, C }