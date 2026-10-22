<script setup lang="ts">
import { ref } from 'vue'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../demos/animate-ui/input-otp'

const SLOTS = [0, 1, 2, 3, 4, 5]
const value = ref('')
const invalid = ref(false)

function change(next: string) {
  value.value = next
  invalid.value = false
}
</script>

<template>
  <div class="flex flex-col items-start gap-10">
    <section data-testid="checked" class="flex items-center gap-6">
      <InputOTP
        :maxlength="6"
        :model-value="value"
        aria-label="Checked code"
        @update:model-value="change"
        @complete="invalid = true"
      >
        <InputOTPGroup>
          <InputOTPSlot v-for="index in SLOTS" :key="index" :index="index" :aria-invalid="invalid" />
        </InputOTPGroup>
      </InputOTP>
      <button type="button" @click="value = ''; invalid = false">
        Reset
      </button>
    </section>

    <section data-testid="fractional" style="padding-left: 0.35px">
      <InputOTP :maxlength="4" aria-label="Fractional code">
        <InputOTPGroup>
          <InputOTPSlot
            v-for="index in [0, 1, 2, 3]"
            :key="index"
            :index="index"
            style="width: 33.3px; height: 33.3px"
          />
        </InputOTPGroup>
      </InputOTP>
    </section>
  </div>
</template>
