<script setup lang="ts">
import { REGEXP_ONLY_DIGITS } from '@animate-ui/vue/primitives/input-otp'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp'
</script>

<template>
  <InputOTP
    :maxlength="6"
    :pattern="REGEXP_ONLY_DIGITS"
    aria-label="One-time password"
  >
    <InputOTPGroup>
      <InputOTPSlot :index="0" />
      <InputOTPSlot :index="1" />
      <InputOTPSlot :index="2" />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot :index="3" />
      <InputOTPSlot :index="4" />
      <InputOTPSlot :index="5" />
    </InputOTPGroup>
  </InputOTP>
</template>
