import { createGame } from './config'
import { bus, GAME_EVENTS } from './bus'
import CinematicScene from './scenes/CinematicScene'
import MazeScene from './scenes/MazeScene'

export function startGame() {
  return createGame([CinematicScene, MazeScene])
}

export { bus, GAME_EVENTS }