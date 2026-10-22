import type { InjectionKey } from 'vue'

export type FlipDirection = 'top' | 'bottom' | 'left' | 'right'

export type FlipButtonContextType = {
  from: () => FlipDirection
  isVertical: () => boolean
  rotateAxis: () => string
}

export const FlipButtonKey: InjectionKey<FlipButtonContextType> = Symbol('FlipButtonContext')

export const FACE_TRANSITION = { type: 'spring', stiffness: 280, damping: 20 } as const

export function buildVariant({
  opacity,
  rotation,
  offset,
  isVertical,
  rotateAxis,
}: {
  opacity: number
  rotation: number
  offset: string | null
  isVertical: boolean
  rotateAxis: string
}) {
  return {
    opacity,
    [rotateAxis]: rotation,
    ...(isVertical && offset !== null ? { y: offset } : {}),
    ...(!isVertical && offset !== null ? { x: offset } : {}),
  }
}
