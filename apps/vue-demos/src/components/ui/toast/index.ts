import { createToastManager } from "@animate-ui/vue/primitives/reka-ui/toast"

export { default as Toaster } from "./Toaster.vue"
export { default as ToastIcon } from "./ToastIcon.vue"
export { default as ToastList } from "./ToastList.vue"

export const toast = createToastManager()
