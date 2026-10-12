import { makeTexture, rect, px, C } from './pixelArt'

const W = 240
const H = 135
const S = 4

function warmWall(g) {
  rect(g, 0, 0, W, 74, S, 0xb57a4a)
  for (let x = 8; x < W; x += 40) {
    rect(g, x, 0, 2, 74, S, 0x9a6238)
  }
  rect(g, 0, 0, W, 6, S, 0x8a5530)
  rect(g, 0, 6, W, 2, S, 0xc98a52)
}

function baseboard(g) {
  rect(g, 0, 74, W, 30, S, 0x6b3f1f)
  rect(g, 0, 74, W, 4, S, 0x7f4c26)
  for (let x = 0; x < W; x += 40) {
    rect(g, x, 74, 2, 30, S, 0x59331a)
  }
  rect(g, 0, 96, W, 2, S, 0xa1652f)
}

function floorBoard(g, y, colorTop, colorLine) {
  rect(g, 0, y, W, 3, S, colorTop)
  rect(g, 0, y + 3, W, 1, S, colorLine)
  for (let x = 6; x < W; x += 21) {
    px(g, x, y, S, colorLine)
  }
}

function windowOnWall(g, x, y) {
  rect(g, x, y, 34, 44, S, 0x6d4a2a)
  rect(g, x + 2, y + 2, 30, 40, S, 0x9fd3e8)
  rect(g, x + 2, y + 2, 30, 40, S, 0x7fbcd9)
  rect(g, x + 17, y + 2, 2, 40, S, 0xffffff)
  rect(g, x + 2, y + 20, 30, 2, S, 0xffffff)
  rect(g, x, y, 34, 3, S, 0x3f2a18)
  px(g, x + 28, y + 8, S, 0xffe082)
  px(g, x + 4, y + 30, S, 0x7cb342)
  px(g, x + 10, y + 32, S, 0x558b2f)
  px(g, x + 6, y + 34, S, 0x8d6e2f)
  rect(g, x - 2, y, 3, 44, S, 0xc0392b)
  rect(g, x + 33, y, 3, 44, S, 0xc0392b)
  rect(g, x - 2, y - 4, 38, 4, S, 0xa1652f)
}

function pictureFrame(g, x, y) {
  rect(g, x, y, 26, 20, S, 0x3f2a18)
  rect(g, x + 2, y + 2, 22, 16, S, 0xf5ead0)
  rect(g, x + 5, y + 5, 4, 3, S, 0xd29a5a)
  px(g, x + 14, y + 5, S, 0xd29a5a)
  px(g, x + 12, y + 7, S, 0xd29a5a)
  rect(g, x + 8, y + 12, 10, 3, S, 0xd29a5a)
  px(g, x + 12, y + 9, S, 0xc0392b)
  px(g, x + 20, y + 10, S, 0xc0392b)
}

function tableSet(g) {
  rect(g, 0, 104, W, 16, S, 0x5a3520)
  rect(g, 0, 104, W, 3, S, 0x6f4428)
  for (let x = 0; x < W; x += 40) {
    rect(g, x, 104, 2, 16, S, 0x4a2c1a)
  }
  rect(g, 0, 104, W, 3, S, 0xf7f1e2)
  rect(g, 0, 99, W, 2, S, 0xdfe0c8)
  px(g, 0, 106, S, 0xf7f1e2)
  px(g, 239, 106, S, 0xf7f1e2)
  rect(g, 48, 118, 6, 2, S, 0x3f2a18)
  rect(g, 186, 118, 6, 2, S, 0x3f2a18)
  rect(g, 120, 118, 6, 2, S, 0x3f2a18)
  rect(g, 0, 128, W, 7, S, 0x7a4a28)
  for (let x = 0; x < W; x += 12) {
    rect(g, x, 131, 1, 2, S, 0x5f3a20)
  }
}

export function generateBackgroundTextures(scene) {
  makeTexture(scene, 'bg_a', W, H, S, (g) => {
    warmWall(g)
    windowOnWall(g, 16, 22)
    pictureFrame(g, 198, 26)
    baseboard(g)
    tableSet(g)
    rect(g, 0, 0, W, H, S, 0xffe9a8)
    rect(g, 0, 0, W, H, S, 0xffcc44)
  })

  makeTexture(scene, 'bg_cast', W, H, S, (g) => {
    rect(g, 0, 0, W, 74, S, 0x2a1b3d)
    for (let x = 8; x < W; x += 40) {
      rect(g, x, 0, 2, 74, S, 0x22153a)
    }
    rect(g, 0, 0, W, 4, S, 0x14091f)
    rect(g, 0, 74, W, 30, S, 0x1c1129)
    for (let x = 0; x < W; x += 40) {
      rect(g, x, 74, 2, 30, S, 0x160d22)
    }
    floorBoard(g, 104, 0x241736, 0x190f28)
    rect(g, 12, 18, 60, 3, S, 0x60487a)
    rect(g, 30, 60, 3, 14, S, 0x60487a)
    rect(g, 40, 22, 3, 30, S, 0x60487a)
    rect(g, 8, 84, 3, 20, S, 0x60487a)
    rect(g, 60, 90, 30, 3, S, 0x60487a)
    rect(g, 200, 10, 3, 60, S, 0x60487a)
    rect(g, 220, 40, 4, 4, S, 0x60487a)
    rect(g, 170, 70, 3, 26, S, 0x60487a)
    rect(g, 0, 125, 240, 10, S, 0x14091f)
    px(g, 20, 80, S, 0x7a5c8f)
    px(g, 22, 82, S, 0x7a5c8f)
    px(g, 24, 84, S, 0x7a5c8f)
    px(g, 23, 83, S, 0x7a5c8f)
    px(g, 130, 100, S, 0x7a5c8f)
    px(g, 132, 102, S, 0x7a5c8f)
    px(g, 134, 104, S, 0x7a5c8f)
  })

  makeTexture(scene, 'bg_c', W, H, S, (g) => {
    rect(g, 0, 0, W, 93, S, 0x12071f)
    rect(g, 0, 93, W, H - 93, S, 0x0c0417)
    rect(g, 0, 90, W, 3, S, 0x1e0f33)
    px(g, 40, 20, S, 0x2a1550)
    px(g, 80, 50, S, 0x2a1550)
    px(g, 190, 30, S, 0x2a1550)
    px(g, 150, 70, S, 0x2a1550)
    px(g, 60, 75, S, 0x2a1550)
    px(g, 210, 80, S, 0x2a1550)
    px(g, 20, 60, S, 0x2a1550)
    px(g, 120, 12, S, 0x2a1550)
  })

  makeTexture(scene, 'bg_d', W, H, S, (g) => {
    rect(g, 0, 0, W, 88, S, 0x0d0521)
    rect(g, 0, 22, W, 66, S, 0x271050)
    rect(g, 0, 52, W, H - 52, S, 0x3d1668)
    for (let i = 0; i < 70; i++) {
      const x = (i * 37) % W
      const y = (i * 23) % 60
      px(g, x, y, S, 0xfff3c4)
    }
    for (let i = 0; i < 40; i++) {
      const x = (i * 53 + 13) % W
      const y = (i * 31 + 7) % 64
      px(g, x, y, S, 0xffffff)
    }
    rect(g, 0, 88, W, 22, S, 0x1a0e3d)
    px(g, 10, 89, S, 0x2d1b58)
    px(g, 20, 91, S, 0x2d1b58)
    px(g, 30, 90, S, 0x2d1b58)
    px(g, 45, 92, S, 0x2d1b58)
    px(g, 60, 89, S, 0x2d1b58)
    px(g, 75, 91, S, 0x2d1b58)
    px(g, 95, 90, S, 0x2d1b58)
    rect(g, 0, 110, W, 25, S, 0x150b30)
    rect(g, 0, 100, W, 2, S, 0x2b1952)
    for (let x = 0; x < W; x += 16) {
      px(g, x, 106, S, 0x1f1240)
    }
    rect(g, 0, 96, W, 4, S, 0x3d2470)
  })

  makeTexture(scene, 'bg_noche', W, H, S, (g) => {
    rect(g, 0, 0, W, H, S, 0x0d0521)
    for (let i = 0; i < 90; i++) {
      const x = (i * 41) % W
      const y = (i * 19) % 96
      px(g, x, y, S, 0xfff3c4)
    }
    for (let i = 0; i < 60; i++) {
      const x = (i * 47 + 9) % W
      const y = (i * 29 + 5) % 96
      px(g, x, y, S, 0xffffff)
    }
    rect(g, 0, 96, W, H - 96, S, 0x160b33)
    px(g, 6, 97, S, 0x281a52)
    px(g, 18, 99, S, 0x281a52)
    px(g, 32, 97, S, 0x281a52)
    px(g, 50, 98, S, 0x281a52)
    px(g, 66, 96, S, 0x281a52)
    px(g, 82, 99, S, 0x281a52)
    px(g, 100, 97, S, 0x281a52)
    rect(g, 0, 120, W, H - 120, S, 0x12081f)
    rect(g, 0, 108, W, 2, S, 0x2b1952)
  })
}