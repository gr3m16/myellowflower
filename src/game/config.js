import Phaser from 'phaser'

export const DESIGN_WIDTH = 960
export const DESIGN_HEIGHT = 540

export const createGame = (scenes, onReady) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    backgroundColor: '#140a26',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    dom: {
      createContainer: false,
    },
    scene: scenes,
  })
}