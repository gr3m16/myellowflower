<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { startGame, bus, GAME_EVENTS } from './game/Game'

const SEED_CARDS = [
  {
    icon: '❤',
    title: 'La Semilla de la Empatía y la Comunicación',
    detail: 'Vence la falta de comunicación y el orgullo.',
    color: 'text-rose-300 border-rose-300/60 bg-rose-500/5',
  },
  {
    icon: '💙',
    title: 'La Semilla de la Confianza Inquebrantable',
    detail: 'Vence los celos y las suposiciones.',
    color: 'text-sky-300 border-sky-300/60 bg-sky-500/5',
  },
  {
    icon: '✨',
    title: 'La Semilla de la Admiración y el Cuidado',
    detail: 'Vence el irrespeto, la rutina y la indiferencia.',
    color: 'text-amber-200 border-amber-200/60 bg-amber-500/5',
  },
]

const gameReady = ref(false)
const cinematicEnded = ref(false)
const mazeActive = ref(false)
const mazeTimeout = ref(false)
const mazeVictory = ref(false)
const mazeLevel = ref(1)
let game = null

onMounted(() => {
  bus.on(GAME_EVENTS.GAME_READY, () => {
    gameReady.value = true
  })
  bus.on(GAME_EVENTS.CINEMATIC_END, () => {
    cinematicEnded.value = true
    gameReady.value = false
  })
  bus.on(GAME_EVENTS.MAZE_START, ({ level }) => {
    mazeLevel.value = level
    mazeActive.value = true
    mazeTimeout.value = false
    mazeVictory.value = false
  })
  bus.on(GAME_EVENTS.MAZE_TIMEOUT, () => {
    mazeTimeout.value = true
  })
  bus.on(GAME_EVENTS.MAZE_VICTORY, () => {
    mazeActive.value = false
    mazeVictory.value = true
  })
  game = startGame()
})

onBeforeUnmount(() => {
  if (game) {
    game.destroy(true)
    game = null
  }
})

function replay() {
  cinematicEnded.value = false
  gameReady.value = false
  mazeActive.value = false
  mazeTimeout.value = false
  mazeVictory.value = false
  if (game) {
    game.destroy(true)
    game = null
  }
  game = startGame()
}

function startMaze() {
  cinematicEnded.value = false
  gameReady.value = false
  mazeActive.value = true
  mazeTimeout.value = false
  mazeVictory.value = false
  if (game) {
    game.scene.start('MazeScene', { level: 1 })
  }
}

function skip() {
  startMaze()
}

function retryMaze() {
  mazeTimeout.value = false
  bus.emit(GAME_EVENTS.MAZE_RETRY)
}

function quitMaze() {
  mazeActive.value = false
  mazeTimeout.value = false
  cinematicEnded.value = true
  bus.emit(GAME_EVENTS.MAZE_QUIT)
}
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-deep-purple">
    <div
      class="pointer-events-none absolute inset-0 opacity-70"
      style="
        background-image: radial-gradient(circle at 20% 30%, #2a1550 0, transparent 30%),
          radial-gradient(circle at 80% 20%, #3d1668 0, transparent 32%),
          radial-gradient(circle at 60% 80%, #271050 0, transparent 34%);
      "
    ></div>

    <header
      class="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4 sm:p-6"
    >
      <div class="retro-text-shadow slide-up">
        <p class="pixel-font text-[10px] text-violet-200 sm:text-xs">
          21 de septiembre · Día de las Flores Amarillas
        </p>
        <h1 class="pixel-font mt-2 text-sm text-gold sm:text-lg">
          Una historia de amor para Mónica 🌻
        </h1>
      </div>

      <button
        v-if="gameReady"
        @click="skip"
        class="pointer-events-auto pixel-font rounded border-2 border-gold/60 px-3 py-2 text-[9px] text-gold transition hover:border-gold hover:bg-gold/10 sm:text-[10px]"
      >
        Saltar
      </button>
      <button
        v-else-if="mazeActive || mazeTimeout"
        @click="quitMaze"
        class="pointer-events-auto pixel-font rounded border-2 border-gold/60 px-3 py-2 text-[9px] text-gold transition hover:border-gold hover:bg-gold/10 sm:text-[10px]"
      >
        Salir
      </button>
    </header>

    <main class="relative z-10 flex h-full w-full items-center justify-center">
      <div
        class="sunflower-border gold-border relative w-[min(96vw,1200px)] overflow-hidden bg-dark-purple"
        style="aspect-ratio: 16 / 9"
      >
        <div id="game-container" class="absolute inset-0"></div>

        <div
          v-if="gameReady && !cinematicEnded"
          class="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
        >
          <p class="pixel-font text-[8px] text-gold/80 sm:text-[9px]">
            Pulsa ESPACIO o haz clic para continuar
          </p>
        </div>
      </div>
    </main>

    <footer
      class="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3"
    >
      <p class="pixel-font text-[8px] text-violet-300/70">
        Hecho con amor, para la mujer que florece todos los días ✿
      </p>
    </footer>

    <Transition name="fade">
      <div
        v-if="cinematicEnded"
        class="absolute inset-0 z-40 flex items-center justify-center bg-deep-purple/90 p-4"
      >
        <div
          class="sunflower-border gold-border w-[min(96vw,880px)] max-h-[92vh] overflow-y-auto bg-black/70 p-6 sm:p-8"
        >
          <p class="pixel-font text-center text-[10px] text-gold sm:text-xs">
            El guía divino te ha entregado
          </p>
          <h2
            class="divine-glow pixel-font mt-3 text-center text-base text-gold sm:text-2xl"
          >
            Las 3 Semillas del Amor
          </h2>

          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div
              v-for="seed in SEED_CARDS"
              :key="seed.title"
              class="slide-up rounded border-2 p-4 text-center"
              :class="seed.color"
            >
              <p class="pixel-font text-3xl">{{ seed.icon }}</p>
              <h3 class="pixel-font mt-3 text-[9px] leading-relaxed sm:text-[11px]">
                {{ seed.title }}
              </h3>
              <p class="pixel-font mt-3 text-[8px] leading-relaxed text-white/70 sm:text-[9px]">
                {{ seed.detail }}
              </p>
            </div>
          </div>

          <p class="pixel-font mx-auto mt-6 max-w-xl text-center text-[9px] leading-relaxed text-violet-200 sm:text-[10px]">
            Cultívalas en tu corazón y nada podrá separar este amor.
            Gui te espera para comenzar la aventura...
          </p>

          <div class="mt-6 flex items-center justify-center gap-4">
            <button
              @click="replay"
              class="pixel-font rounded border-2 border-gold/70 px-5 py-3 text-[10px] text-gold transition hover:border-gold hover:bg-gold/10"
            >
              Volver a ver
            </button>
            <button
              @click="startMaze"
              class="pixel-font rounded bg-gold px-5 py-3 text-[10px] text-deep-purple transition hover:bg-gold-glow"
            >
              Comenzar la aventura 🚀
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="mazeTimeout"
        class="absolute inset-0 z-40 flex items-center justify-center bg-deep-purple/85 p-4"
      >
        <div class="sunflower-border gold-border w-[min(94vw,560px)] bg-black/75 p-8 text-center">
          <h2 class="divine-glow pixel-font text-xl text-gold sm:text-2xl">
            ¡Se acabó el tiempo!
          </h2>
          <p class="pixel-font mx-auto mt-4 max-w-sm text-[9px] leading-relaxed text-violet-200 sm:text-[10px]">
            Las sombras vuelven a cerrarse... pero el amor que siembras
            también aprende a levantarse. Volvamos a intentarlo, papá.
          </p>
          <div class="mt-7 flex items-center justify-center gap-4">
            <button
              @click="quitMaze"
              class="pixel-font rounded border-2 border-gold/70 px-5 py-3 text-[10px] text-gold transition hover:border-gold hover:bg-gold/10"
            >
              Salir
            </button>
            <button
              @click="retryMaze"
              class="pixel-font rounded bg-gold px-5 py-3 text-[10px] text-deep-purple transition hover:bg-gold-glow"
            >
              Volver a intentar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="mazeVictory"
        class="absolute inset-0 z-40 flex items-center justify-center bg-deep-purple/90 p-4"
      >
        <div
          class="sunflower-border gold-border w-[min(96vw,880px)] max-h-[92vh] overflow-y-auto bg-black/75 p-6 text-center sm:p-10"
        >
          <p class="pixel-font text-3xl">🌻🌻🌻</p>
          <h2 class="divine-glow pixel-font mt-4 text-2xl text-gold sm:text-4xl">
            ¡Lo lograste, papá!
          </h2>
          <p class="pixel-font mx-auto mt-5 max-w-xl text-[9px] leading-relaxed text-violet-100 sm:text-[11px]">
            Recuperaste las 3 Semillas del Amor: la empatía, la confianza y
            la admiración. Ahora, solo falta entregarlas con tus flores
            amarillas...
          </p>
          <p class="pixel-font mx-auto mt-4 max-w-xl text-[10px] leading-relaxed text-gold sm:text-[13px]">
            Mónica, un 21 de septiembre, estas flores llevan el amor más
            sincero: el de un hombre que supo atravesar sus propios
            laberintos para llegar a ti. 💛
          </p>
          <div class="mt-8 flex items-center justify-center gap-4">
            <button
              @click="replay"
              class="pixel-font rounded border-2 border-gold/70 px-5 py-3 text-[10px] text-gold transition hover:border-gold hover:bg-gold/10"
            >
              Volver a ver la historia
            </button>
            <button
              @click="startMaze"
              class="pixel-font rounded bg-gold px-5 py-3 text-[10px] text-deep-purple transition hover:bg-gold-glow"
            >
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>