import type { InjectionKey } from 'vue'

/** Whether the stars background is on screen: its layers only move while it is. */
export const StarsInViewKey: InjectionKey<() => boolean> = Symbol('StarsInView')
