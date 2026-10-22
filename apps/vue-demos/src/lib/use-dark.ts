import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Whether the site is in its dark theme (next-themes' class on the root). */
export function useDark() {
  const dark = ref(false)
  const read = () => {
    dark.value = document.documentElement.classList.contains('dark')
  }
  const observer = new MutationObserver(read)
  onMounted(() => {
    read()
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
  })
  onBeforeUnmount(() => observer.disconnect())
  return dark
}
