<script setup lang="ts">
import type { CheckAnimation } from '@animate-ui/vue/provider'
import { AnimateUIProvider } from '@animate-ui/vue/provider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

withDefaults(
  defineProps<{
    position?: 'popper' | 'item-aligned'
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    align?: 'start' | 'center' | 'end'
    alignOffset?: number
    checkAnimation?: CheckAnimation
  }>(),
  {
    position: 'item-aligned',
    side: 'bottom',
    sideOffset: 0,
    align: 'center',
    alignOffset: 0,
    checkAnimation: 'draw',
  },
)
</script>

<template>
  <AnimateUIProvider :check-animation="checkAnimation">
    <Select>
      <SelectTrigger class="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent
        :position="position"
        :side="side"
        :side-offset="Number(sideOffset)"
        :align="align"
        :align-offset="Number(alignOffset)"
      >
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">
            Apple
          </SelectItem>
          <SelectItem value="banana">
            Banana
          </SelectItem>
          <SelectItem value="blueberry">
            Blueberry
          </SelectItem>
          <SelectItem value="grapes">
            Grapes
          </SelectItem>
          <SelectItem value="pineapple">
            Pineapple
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </AnimateUIProvider>
</template>
