"use client"

import * as React from "react"
import {
  MotionGrid,
  MotionGridCells,
  type Frames,
} from "@animate-ui/react/primitives/motion-grid"
import {
  RotatingText,
  RotatingTextContainer,
} from "@animate-ui/react/primitives/texts/rotating"
import { motion } from "motion/react"

const importingFrames = [
  [[2, 2]],
  [[1, 2], [2, 1], [2, 3], [3, 2]],
  [[2, 2], [0, 2], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 2]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 2], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [1, 0], [3, 0], [4, 1], [0, 3], [1, 4], [3, 4], [4, 3]],
  [[0, 0], [0, 4], [4, 0], [4, 4]],
  [],
] as Frames

const arrowDownFrames = [
  [[2, 0]],
  [[1, 0], [2, 0], [3, 0], [2, 1]],
  [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[2, 0], [2, 1], [1, 2], [2, 2], [3, 2], [2, 3]],
  [[2, 1], [2, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[2, 2], [2, 3], [1, 4], [2, 4], [3, 4]],
  [[2, 3], [2, 4]],
  [[2, 4]],
  [],
] as Frames

const arrowUpFrames = [
  [[2, 4]],
  [[1, 4], [2, 4], [3, 4], [2, 3]],
  [[2, 4], [1, 3], [2, 3], [3, 3], [2, 2]],
  [[2, 4], [2, 3], [1, 2], [2, 2], [3, 2], [2, 1]],
  [[2, 3], [2, 2], [1, 1], [2, 1], [3, 1], [2, 0]],
  [[2, 2], [2, 1], [1, 0], [2, 0], [3, 0]],
  [[2, 1], [2, 0]],
  [[2, 0]],
  [],
] as Frames

const syncingFrames = [...arrowDownFrames, ...arrowUpFrames] as Frames

const searchingFrames = [
  [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[3, 0], [2, 1], [3, 1], [4, 1], [3, 2]],
  [[3, 1], [2, 2], [3, 2], [4, 2], [3, 3]],
  [[3, 2], [2, 3], [3, 3], [4, 3], [3, 4]],
  [[1, 2], [0, 3], [1, 3], [2, 3], [1, 4]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
  [],
] as Frames

const busyFrames = [
  [[0, 1], [0, 2], [0, 3], [1, 2], [4, 1], [4, 2], [4, 3]],
  [[0, 1], [0, 2], [0, 3], [2, 3], [4, 2], [4, 3], [4, 4]],
  [[0, 1], [0, 2], [0, 3], [3, 4], [4, 2], [4, 3], [4, 4]],
  [[0, 1], [0, 2], [0, 3], [2, 3], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [2, 1], [4, 1], [4, 2], [4, 3]],
  [[0, 0], [0, 1], [0, 2], [3, 0], [4, 0], [4, 1], [4, 2]],
  [[0, 1], [0, 2], [0, 3], [2, 1], [4, 0], [4, 1], [4, 2]],
] as Frames

const savingFrames = [
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [2, 3], [3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [4, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [4, 0], [4, 1], [4, 2], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1], [3, 0], [4, 0], [4, 1], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [2, 0], [4, 0], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
] as Frames

const initializingFrames = [
  [],
  [[1, 0], [3, 0]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2]],
  [[2, 2]],
  [],
] as Frames

const states = {
  importing: {
    frames: importingFrames,
    label: "Importing",
  },
  syncing: {
    frames: syncingFrames,
    label: "Syncing",
  },
  searching: {
    frames: searchingFrames,
    label: "Searching",
  },
  busy: {
    frames: busyFrames,
    label: "Busy",
  },
  saving: {
    frames: savingFrames,
    label: "Saving",
  },
  initializing: {
    frames: initializingFrames,
    label: "Initializing",
  },
}

type State = keyof typeof states

const ORDER = Object.keys(states) as State[]

export default function MotionGridDemo() {
  const [state, setState] = React.useState<State>("importing")

  // Cycle through the states every 3 seconds.
  React.useEffect(() => {
    const interval = setInterval(() => {
      setState((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    // The button resizes with its label (a layout animation) and responds to
    // hover and press.
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex h-11 items-center justify-center gap-x-3 rounded-lg bg-primary px-3 text-sm font-medium"
    >
      <motion.div layout="preserve-aspect">
        <MotionGrid
          gridSize={[5, 5]}
          frames={states[state].frames}
          className="w-fit gap-0.5"
        >
          <MotionGridCells className="aspect-square size-[3px] rounded-full bg-primary-foreground/20 data-[active=true]:bg-primary-foreground/80" />
        </MotionGrid>
      </motion.div>
      <RotatingTextContainer
        text={states[state].label}
        className="absolute top-1/2 left-[46px] -translate-y-1/2"
      >
        <RotatingText
          layout="preserve-aspect"
          className="text-primary-foreground"
        />
      </RotatingTextContainer>
      {/* Sizes the button to the current label. */}
      <span className="invisible opacity-0" aria-hidden>
        {states[state].label}
      </span>
    </motion.button>
  )
}
