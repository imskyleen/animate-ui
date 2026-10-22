<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Progress } from '@/components/ui/progress'

const progress = ref(13)

let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  timer = setTimeout(() => {
    progress.value = 66
  }, 500)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Progress :model-value="progress" class="w-[60%]" />
</template>
