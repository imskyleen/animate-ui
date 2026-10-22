import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/** Whether the page is visible (its tab in front). */
function usePageVisible(): Ref<boolean> {
  const visible = ref(true);
  const update = () => {
    visible.value = document.visibilityState === 'visible';
  };
  onMounted(() => {
    update();
    document.addEventListener('visibilitychange', update);
  });
  onBeforeUnmount(() =>
    document.removeEventListener('visibilitychange', update),
  );
  return visible;
}

export { usePageVisible };
