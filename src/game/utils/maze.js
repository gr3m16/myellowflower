export function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

function generateMaze(C, R, rng, extraOpenings) {
  const h = 2 * R + 1
  const w = 2 * C + 1
  const grid = Array.from({ length: h }, () => Array(w).fill(1))
  const stack = [[0, 0]]
  grid[1][1] = 0
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1]
    const options = DIRS.map(([dx, dy]) => [cx + dx, cy + dy]).filter(
      ([nx, ny]) =>
        nx >= 0 && nx < C && ny >= 0 && ny < R && grid[2 * ny + 1][2 * nx + 1] === 1
    )
    if (!options.length) {
      stack.pop()
      continue
    }
    const [nx, ny] = options[Math.floor(rng() * options.length)]
    grid[2 * cy + 1 + (ny - cy)][2 * cx + 1 + (nx - cx)] = 0
    grid[2 * ny + 1][2 * nx + 1] = 0
    stack.push([nx, ny])
  }
  for (let i = 0; i < extraOpenings; i++) openWall(grid, C, R, rng)
  return grid
}

function openWall(grid, C, R, rng) {
  let guard = 3000
  while (guard--) {
    const horizontal = rng() < 0.5
    const mx = horizontal
      ? 2 * Math.floor(rng() * (C - 1)) + 2
      : 2 * Math.floor(rng() * C) + 1
    const my = horizontal
      ? 2 * Math.floor(rng() * (R - 1)) + 2
      : 2 * Math.floor(rng() * R) + 1
    if (grid[my] === undefined || grid[my][mx] !== 1) continue
    const across = horizontal
      ? [grid[my][mx - 1], grid[my][mx + 1]]
      : [grid[my - 1][mx], grid[my + 1][mx]]
    if (across[0] === 0 && across[1] === 0) {
      grid[my][mx] = 0
      return
    }
  }
}

function bfsDist(grid, sx, sy) {
  const h = grid.length
  const w = grid[0].length
  const dist = Array.from({ length: h }, () => Array(w).fill(-1))
  const prev = Array.from({ length: h }, () => Array(w).fill(-1))
  const q = [[sx, sy]]
  dist[sy][sx] = 0
  while (q.length) {
    const [x, y] = q.shift()
    for (const [dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx] === 0 && dist[ny][nx] === -1) {
        dist[ny][nx] = dist[y][x] + 1
        prev[ny][nx] = y * w + x
        q.push([nx, ny])
      }
    }
  }
  return { dist, prev }
}

function openNeighbors(grid, x, y) {
  const out = []
  for (const [dx, dy] of DIRS) {
    if (grid[y + dy]?.[x + dx] === 0) out.push([x + dx, y + dy])
  }
  return out
}

function bfsOnMap(map) {
  const h = map.length
  const w = map[0].length
  const seen = Array.from({ length: h }, () => Array(w).fill(false))
  let sx = -1
  let sy = -1
  for (let y = 0; y < h && sx < 0; y++) {
    for (let x = 0; x < w; x++) {
      if (map[y][x] === 'S') {
        sx = x
        sy = y
        break
      }
    }
  }
  const q = [[sx, sy]]
  seen[sy][sx] = true
  while (q.length) {
    const [x, y] = q.shift()
    for (const [dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      if (map[ny][nx] === '#') continue
      if (seen[ny][nx]) continue
      seen[ny][nx] = true
      q.push([nx, ny])
    }
  }
  return seen
}

function openIslandWall(map, seen) {
  const h = map.length
  const w = map[0].length
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (seen[y][x] || map[y][x] === '#') continue
      for (const [dx, dy] of DIRS) {
        const wx = x + dx
        const wy = y + dy
        if (wx < 0 || wy < 0 || wx >= w || wy >= h || map[wy][wx] !== '#') continue
        const bx = x + dx * 2
        const by = y + dy * 2
        if (bx < 0 || by < 0 || bx >= w || by >= h) continue
        if (seen[by][bx]) {
          map[wy] = map[wy].slice(0, wx) + ' ' + map[wy].slice(wx + 1)
          return true
        }
      }
    }
  }
  return false
}

function ensureReachable(map) {
  let guard = 500
  while (guard--) {
    const seen = bfsOnMap(map)
    if (!openIslandWall(map, seen)) break
  }
  return map
}

export function generateLevel(num) {
  const params = [
    { seed: 21, extraOpenings: 1, traps: 2 },
    { seed: 51, extraOpenings: 3, traps: 5 },
    { seed: 87, extraOpenings: 5, traps: 8 },
  ][num - 1]
  const C = 12
  const R = 6
  const rng = mulberry32(params.seed)
  const grid = generateMaze(C, R, rng, params.extraOpenings)
  const h = grid.length
  const w = grid[0].length

  const sx = 1
  const sy = 1
  const { dist, prev } = bfsDist(grid, sx, sy)

  let ex = sx
  let ey = sy
  let best = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === 0 && dist[y][x] > best) {
        best = dist[y][x]
        ex = x
        ey = y
      }
    }
  }

  const shortest = new Set()
  let cur = ey * w + ex
  while (cur !== -1) {
    const y = Math.floor(cur / w)
    const x = cur % w
    shortest.add(y * w + x)
    cur = prev[y][x]
  }

  const candidates = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== 0) continue
      if (shortest.has(y * w + x)) continue
      const near = openNeighbors(grid, x, y).length
      if (near >= 1 && near <= 2) candidates.push([x, y])
    }
  }
  const traps = []
  const pool = [...candidates]
  while (traps.length < params.traps && pool.length) {
    const i = Math.floor(rng() * pool.length)
    const [tx, ty] = pool.splice(i, 1)[0]
    traps.push([tx, ty])
  }

  const map = grid.map((row, y) =>
    row
      .map((v, x) => {
        if (x === sx && y === sy) return 'S'
        if (x === ex && y === ey) return 'E'
        if (traps.some(([tx, ty]) => tx === x && ty === y)) return 'T'
        return v === 1 ? '#' : ' '
      })
      .join('')
  )
  map.push('#'.repeat(w))

  return {
    grid: ensureReachable(map),
    rows: map.length,
    cols: w,
    h: map.length,
    w,
    start: { x: sx, y: sy },
    exit: { x: ex, y: ey },
    traps: traps.map(([x, y]) => ({ x, y })),
    pathLen: best,
    dist,
  }
}

export function distFrom(map, sx, sy) {
  const h = map.length
  const w = map[0].length
  const dist = Array.from({ length: h }, () => Array(w).fill(Infinity))
  const q = [[sx, sy]]
  dist[sy][sx] = 0
  while (q.length) {
    const [x, y] = q.shift()
    for (const [dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      if (map[ny][nx] === '#') continue
      if (dist[ny][nx] !== Infinity) continue
      dist[ny][nx] = dist[y][x] + 1
      q.push([nx, ny])
    }
  }
  return dist
}

export function solveDist(maze) {
  let start
  let exit
  for (let y = 0; y < maze.h; y++) {
    for (let x = 0; x < maze.w; x++) {
      const c = maze.grid[y][x]
      if (c === 'S') start = { x, y }
      if (c === 'E') exit = { x, y }
    }
  }
  const { dist } = bfsDist(
    maze.grid.map((row) => row.split('').map((c) => (c === '#' ? 1 : 0))),
    start.x,
    start.y
  )
  return { dist, exit }
}