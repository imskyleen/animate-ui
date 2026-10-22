<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, provide, reactive } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  routeLocationKey,
  routerKey,
  RouterView,
  routerViewLocationKey,
  START_LOCATION,
} from 'vue-router'
import { PageTransition, routeTransitions } from '../../../v2/registry/vue/components/page-transition'

const page = (title: string) => defineComponent({ render: () => h('h1', { class: 'text-4xl font-medium' }, title) })

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: page('Home') },
    { path: '/docs', component: page('Docs') },
  ],
})

// What app.use(router) provides, for this fixture alone.
const route = reactive(
  Object.fromEntries(
    Object.keys(START_LOCATION).map(key => [
      key,
      computed(() => router.currentRoute.value[key as keyof typeof START_LOCATION]),
    ]),
  ),
)
provide(routerKey, router)
provide(routeLocationKey, route as never)
provide(routerViewLocationKey, router.currentRoute)

const stop = routeTransitions(router)
onBeforeUnmount(stop)
void router.replace('/')
</script>

<template>
  <div class="flex flex-col gap-6">
    <nav class="flex gap-2">
      <button type="button" @click="router.push('/docs')">
        Go to docs
      </button>
      <button type="button" @click="router.back()">
        Go back
      </button>
    </nav>
    <RouterView v-slot="{ Component }">
      <PageTransition effect="slide" class="flex h-64 flex-col justify-end bg-muted p-8">
        <component :is="Component" />
      </PageTransition>
    </RouterView>
  </div>
</template>
