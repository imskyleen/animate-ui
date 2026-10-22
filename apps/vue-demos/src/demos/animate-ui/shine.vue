<script setup lang="ts">
import { Shine } from '@animate-ui/vue/primitives/effects/shine'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    delay?: number | string
    duration?: number | string
    loop?: boolean | string
    loopDelay?: number | string
    deg?: number | string
    enable?: boolean | string
    enableOnHover?: boolean | string
    enableOnTap?: boolean | string
  }>(),
  {
    delay: 0,
    duration: 1200,
    loop: true,
    loopDelay: 500,
    deg: -15,
    enable: true,
    enableOnHover: false,
    enableOnTap: false,
  },
)

const on = (value: boolean | string) => value === true || value === 'true'
</script>

<template>
  <Shine
    as-child
    :delay="Number(delay)"
    :duration="Number(duration)"
    :loop="on(loop)"
    :loop-delay="Number(loopDelay)"
    :deg="Number(deg)"
    :enable="on(enable)"
    :enable-on-hover="on(enableOnHover)"
    :enable-on-tap="on(enableOnTap)"
  >
    <Button size="lg">
      Get started
    </Button>
  </Shine>
</template>
