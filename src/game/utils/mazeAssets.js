import { makeTexture, rect, px } from './pixelArt'

const S = 4

function p(g, x, y, color) {
  px(g, Math.round(x), Math.round(y), S, color)
}

function r(g, x, y, w, h, color) {
  rect(g, Math.round(x), Math.round(y), Math.round(w), Math.round(h), S, color)
}

function tri(g, x1, y1, x2, y2, x3, y3, color, a = 1) {
  g.fillStyle(color, a)
  g.fillTriangle(Math.round(x1 * S), Math.round(y1 * S), Math.round(x2 * S), Math.round(y2 * S), Math.round(x3 * S), Math.round(y3 * S))
}

function circ(g, cx, cy, rad, color, a = 1) {
  g.fillStyle(color, a)
  g.fillCircle(Math.round(cx * S), Math.round(cy * S), Math.max(1, Math.round(rad * S)))
}

function ell(g, cx, cy, w, h, color, a = 1) {
  g.fillStyle(color, a)
  g.fillEllipse(Math.round(cx * S), Math.round(cy * S), Math.max(1, Math.round(w * S)), Math.max(1, Math.round(h * S)))
}

function stars(g, count, seedBase, brightColor, dimColor) {
  for (let i = 0; i < count; i++) {
    const x = ((i * 57 + seedBase) % 236) + 2
    const y = ((i * 31 + seedBase * 3) % 92) + 2
    p(g, x, y, i % 3 === 0 ? brightColor : dimColor)
  }
}

function skyBands(g) {
  const bands = [
    [0, 0x070317],
    [6, 0x0d0521],
    [16, 0x170a33],
    [28, 0x221248],
    [42, 0x2d175a],
    [58, 0x3a1f6d],
    [74, 0x452576],
    [86, 0x4d2a7d],
    [96, 0x542f82],
  ]
  for (let i = 0; i < bands.length - 1; i++) {
    r(g, 0, bands[i][0], 240, bands[i + 1][0] - bands[i][0], bands[i][1])
  }
  r(g, 0, 96, 240, 6, bands[bands.length - 1][1])
}

function mountainRange(g, baseY, peakHeight, color, { seed = 1, spacing = 14, topColor } = {}) {
  for (let i = 0; i < 240 / spacing + 2; i++) {
    const x0 = i * spacing
    const w = spacing * 0.9
    const h = peakHeight - ((i * 53 + seed * 13) % Math.max(2, peakHeight >> 1))
    tri(g, x0, baseY, x0 + w, baseY, x0 + (w * 3) / 5, baseY - h, color)
    if (topColor) {
      p(g, x0 + Math.floor(w * 0.38), baseY - h, topColor)
      p(g, x0 + Math.floor(w * 0.42), baseY - h, topColor)
    }
  }
}

function pineRow(g, baseY, color, { seed = 5, spacing = 16 } = {}) {
  for (let i = 0; i < 240 / spacing + 2; i++) {
    const x0 = i * spacing + ((i * 29 + seed * 7) % 8)
    const h = 12 + ((i * 23 + seed * 3) % 12)
    const w = 4 + (i * 17 % 3)
    tri(g, x0, baseY, x0 + w, baseY, x0 + w / 2, baseY - h, color)
  }
}

export function generateMazeTextures(scene) {
  makeTexture(scene, 'bg_forest', 240, 135, S, (g) => {
    skyBands(g)
    stars(g, 130, 11, 0xfff3c4, 0x8f7bc9)
    stars(g, 70, 37, 0xffffff, 0x6f5bb0)
    stars(g, 40, 83, 0xffe9a8, 0xa68ac9)
    circ(g, 188, 22, 8, 0xffe9a8, 0.85)
    circ(g, 188, 22, 12, 0xffe9a8, 0.5)
    circ(g, 188, 22, 17, 0xffe9a8, 0.25)
    circ(g, 186, 20, 2, 0xfff3c4, 0.95)
    mountainRange(g, 104, 46, 0x170b34, { seed: 3 })
    mountainRange(g, 98, 36, 0x241246, { seed: 9, topColor: 0x33206a })
    pineRow(g, 106, 0x0d041f, { seed: 11 })
    pineRow(g, 118, 0x0e0726, { seed: 13 })
    r(g, 0, 98, 240, 2, 0x3a1f6d)
    r(g, 0, 122, 240, 13, 0x0d140d)
    r(g, 0, 120, 240, 2, 0x15210f)
  })

  makeTexture(scene, 'bg_night', 240, 135, S, (g) => {
    r(g, 0, 0, 240, 135, 0x0d0521)
    stars(g, 150, 21, 0xfff3c4, 0x9b83c9)
    stars(g, 70, 47, 0xffffff, 0x6f5bb0)
    mountainRange(g, 110, 50, 0x150a30, { seed: 1 })
    pineRow(g, 112, 0x0d041f, { seed: 7 })
    r(g, 0, 122, 240, 13, 0x111a10)
    r(g, 0, 136, 240, 1, 0x15210f)
  })

  makeTexture(scene, 'bg_dawn', 240, 135, S, (g) => {
    const dawnBands = [
      [0, 0x8fbce8],
      [10, 0xa6ccf0],
      [24, 0xc4dff5],
      [40, 0xdcf0f7],
      [54, 0xeff8f8],
      [68, 0xfdf7dd],
      [82, 0xfff0c4],
    ]
    for (let i = 0; i < dawnBands.length - 1; i++) {
      r(g, 0, dawnBands[i][0], 240, dawnBands[i + 1][0] - dawnBands[i][0], dawnBands[i][1])
    }
    r(g, 0, 96, 240, 39, dawnBands[dawnBands.length - 1][1])
    circ(g, 150, 84, 9, 0xffe082, 0.95)
    circ(g, 150, 84, 14, 0xfff0b0, 0.6)
    circ(g, 150, 84, 22, 0xfff3c4, 0.35)
    mountainRange(g, 100, 40, 0x9fc4e0, { seed: 3 })
    mountainRange(g, 106, 30, 0xbfd8ec, { seed: 9, topColor: 0xd8ecf7 })
    ell(g, 30, 34, 9, 3, 0xfffbeb, 0.9)
    ell(g, 78, 26, 12, 3, 0xfffbeb, 0.8)
    ell(g, 200, 30, 10, 3, 0xfffbeb, 0.85)
    r(g, 0, 118, 240, 17, 0x79a3c4)
    r(g, 0, 118, 240, 3, 0x9fc9de)
    r(g, 0, 128, 240, 2, 0x5c85a6)
  })

  makeTexture(scene, 'bg_sunset', 240, 135, S, (g) => {
    const sBands = [
      [0, 0x2a1238],
      [8, 0x4a1d3c],
      [20, 0x7a2840],
      [34, 0xad3b33],
      [48, 0xd65a2b],
      [60, 0xf0742f],
      [72, 0xf7933b],
      [82, 0xfbac51],
    ]
    for (let i = 0; i < sBands.length - 1; i++) {
      r(g, 0, sBands[i][0], 240, sBands[i + 1][0] - sBands[i][0], sBands[i][1])
    }
    r(g, 0, 96, 240, 39, sBands[sBands.length - 1][1])
    circ(g, 172, 88, 13, 0xffe282, 1)
    circ(g, 172, 88, 22, 0xffb347, 0.55)
    circ(g, 172, 88, 34, 0xff8a3b, 0.28)
    mountainRange(g, 102, 44, 0x3a1a24, { seed: 5 })
    mountainRange(g, 110, 32, 0x5a2b2a, { seed: 9, topColor: 0x8a4436 })
    tri(g, 24, 118, 34, 104, 44, 118, 0x6a3328)
    tri(g, 96, 122, 106, 108, 118, 122, 0x7a3d2e)
    tri(g, 168, 120, 180, 106, 192, 120, 0x6a3328)
    r(g, 0, 122, 240, 13, 0x40201f)
    r(g, 0, 120, 240, 2, 0x8a4436)
  })

  makeTexture(scene, 'bg_nightforest', 240, 135, S, (g) => {
    const nBands = [
      [0, 0x040218],
      [10, 0x0b0522],
      [26, 0x150930],
      [44, 0x231044],
      [62, 0x30175a],
      [78, 0x3a1f6d],
    ]
    for (let i = 0; i < nBands.length - 1; i++) {
      r(g, 0, nBands[i][0], 240, nBands[i + 1][0] - nBands[i][0], nBands[i][1])
    }
    r(g, 0, 96, 240, 39, nBands[nBands.length - 1][1])
    stars(g, 130, 11, 0xfff3c4, 0x9b83c9)
    stars(g, 70, 37, 0xffffff, 0x6f5bb0)
    stars(g, 30, 83, 0xcc88ff, 0x8a5ac4)
    circ(g, 196, 26, 7, 0xfff3c4, 1)
    circ(g, 196, 26, 11, 0xfff3c4, 0.5)
    circ(g, 196, 26, 17, 0xfff3c4, 0.2)
    mountainRange(g, 104, 40, 0x150a30, { seed: 1 })
    mountainRange(g, 100, 30, 0x241246, { seed: 7, topColor: 0x33206a })
    pineRow(g, 106, 0x0d041f, { seed: 11 })
    pineRow(g, 118, 0x0e0726, { seed: 13 })
    r(g, 0, 122, 240, 13, 0x08051a)
    r(g, 0, 120, 240, 2, 0x2b1952)
  })

  makeTexture(scene, 'tree', 18, 30, S, (g) => {
    for (let i = 0; i < 8; i++) {
      const w = 3 + i * 1.6
      r(g, Math.round(9 - w / 2), 4 + i * 3, w, 3, 0x0d0720)
    }
    r(g, 7, 26, 4, 4, 0x0a051a)
    p(g, 8, 12, 0x1c0f3d)
    p(g, 10, 18, 0x1c0f3d)
    p(g, 9, 22, 0x150a30)
  })

  makeTexture(scene, 'thorn', 14, 11, S, (g) => {
    tri(g, 3, 9, 7, 2, 6, 12, 0xff3b6b)
    tri(g, 10, 5, 13, 11, 8, 7, 0xff3b6b)
    tri(g, 4, 3, 10, 6, 8, 0, 0xff5aa8)
    p(g, 6, 3, 0xffc9dc)
    p(g, 10, 5, 0xffc9dc)
    p(g, 5, 8, 0xb0204a)
    p(g, 9, 9, 0xb0204a)
    p(g, 3, 6, 0xff7aa8)
    p(g, 12, 8, 0xff7aa8)
  })

  makeTexture(scene, 'cizana_mini', 16, 16, S, (g) => {
    r(g, 6, 3, 4, 3, 0x1a0d2e)
    r(g, 5, 5, 6, 9, 0x1a0d2e)
    r(g, 3, 8, 10, 5, 0x1a0d2e)
    p(g, 2, 10, 0x5a1f86)
    p(g, 13, 11, 0x5a1f86)
    p(g, 5, 14, 0x2b1347)
    p(g, 10, 15, 0x2b1347)
    p(g, 4, 12, 0x7a2ea8)
    p(g, 11, 12, 0x7a2ea8)
    r(g, 6, 6, 1, 2, 0xff2bd6)
    r(g, 9, 6, 1, 2, 0xff2bd6)
    p(g, 6, 7, 0xff9df0)
    p(g, 9, 7, 0xff9df0)
  })

  makeTexture(scene, 'petal', 5, 4, S, (g) => {
    p(g, 1, 0, 0xffe066)
    p(g, 3, 0, 0xffd54f)
    p(g, 0, 1, 0xffd700)
    p(g, 2, 1, 0xffcc33)
    p(g, 4, 1, 0xffd54f)
    p(g, 1, 2, 0xf5c542)
    p(g, 3, 2, 0xf0b83a)
    p(g, 2, 3, 0xe8b02f)
  })

  makeTexture(scene, 'firefly', 6, 6, S, (g) => {
    circ(g, 3, 3, 3, 0xccff66, 0.18)
    circ(g, 3, 3, 2, 0xd6f79a, 0.5)
    circ(g, 3, 3, 1, 0xffffff, 0.95)
  })

  makeTexture(scene, 'sunflower', 24, 28, S, (g) => {
    const petals = [
      [0, -1],
      [0.707, -0.707],
      [1, 0],
      [0.707, 0.707],
      [0, 1],
      [-0.707, 0.707],
      [-1, 0],
      [-0.707, -0.707],
    ]
    for (const [dx, dy] of petals) {
      circ(g, 12 + dx * 5, 11 + dy * 5, 3, 0xffcc33)
      circ(g, 12 + dx * 5, 11 + dy * 5, 2, 0xffe066)
    }
    circ(g, 12, 11, 5, 0x8a5a22)
    circ(g, 12, 11, 4, 0x6b3c17)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      p(g, 12 + Math.round(Math.cos(a) * 2), 11 + Math.round(Math.sin(a) * 2), 0x2b1508)
    }
    circ(g, 18, 24, 2, 0x3d8a4f)
    circ(g, 7, 25, 2, 0x3d8a4f)
    r(g, 10, 21, 4, 5, 0x2e7142)
  })

  makeTexture(scene, 'tree_big', 26, 44, S, (g) => {
    for (let i = 0; i < 11; i++) {
      const w = 4 + i * 1.8
      r(g, Math.round(13 - w / 2), 3 + i * 3, w, 3, 0x0c0620)
    }
    r(g, 11, 36, 4, 8, 0x0a051a)
  })

  makeTexture(scene, 'maze_wall', 9, 9, S, (g) => {
    r(g, 0, 0, 9, 9, 0xffffff)
  })

  makeTexture(scene, 'shadow', 8, 3, S, (g) => {
    g.fillStyle(0x000000, 0.3)
    g.fillEllipse(4 * S, 1 * S, 8 * S, 3 * S)
  })

  if (!scene.textures.exists('halo')) {
    makeTexture(scene, 'halo', 64, 64, S, (g) => {
      for (let i = 0; i < 6; i++) {
        const a = 0.22 - i * 0.035
        g.fillStyle(0xffd700, a)
        g.fillCircle(32 * S, 32 * S, (30 - i * 5) * S)
      }
    })
  }
  if (!scene.textures.exists('spark')) {
    makeTexture(scene, 'spark', 2, 2, S, (g) => {
      p(g, 0, 0, 0xffffff)
      p(g, 1, 1, 0xfff3c4)
    })
  }
}