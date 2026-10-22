<script setup lang="ts">
import BubbleBackground from '../../../v2/registry/vue/backgrounds/bubble/BubbleBackground.vue'
import FireworksBackground from '../../../v2/registry/vue/backgrounds/fireworks/FireworksBackground.vue'
import GlyphBackground from '../../../v2/registry/vue/backgrounds/glyph/GlyphBackground.vue'
import GradientBackground from '../../../v2/registry/vue/backgrounds/gradient/GradientBackground.vue'
import GravityStarsBackground from '../../../v2/registry/vue/backgrounds/gravity-stars/GravityStarsBackground.vue'
import HexagonBackground from '../../../v2/registry/vue/backgrounds/hexagon/HexagonBackground.vue'
import HoleBackground from '../../../v2/registry/vue/backgrounds/hole/HoleBackground.vue'
import StarsBackground from '../../../v2/registry/vue/backgrounds/stars/StarsBackground.vue'
import TopographyBackground from '../../../v2/registry/vue/backgrounds/topography/TopographyBackground.vue'
import Toggled from './backgrounds-toggled.vue'

const SECTION = 'relative mb-[150vh] h-[400px] w-[640px] overflow-hidden'
</script>

<template>
  <div>
    <section data-testid="bubble" :class="SECTION">
      <BubbleBackground interactive class="absolute inset-0" />
    </section>
    <section data-testid="fireworks" :class="SECTION">
      <FireworksBackground class="absolute inset-0" color="#737373" />
    </section>
    <section data-testid="glyph" :class="SECTION">
      <GlyphBackground class="absolute inset-0 bg-[#121212] text-white" />
    </section>
    <section data-testid="glyph-colors" :class="SECTION">
      <GlyphBackground class="absolute inset-0 bg-[#121212]" glow-color="#ff0000" shape-color="#00ff00" />
    </section>
    <section data-testid="gradient" :class="SECTION">
      <GradientBackground class="absolute inset-0" />
    </section>
    <section data-testid="gravity-stars" :class="SECTION">
      <GravityStarsBackground class="absolute inset-0" />
    </section>
    <section data-testid="hexagon" :class="SECTION">
      <HexagonBackground class="absolute inset-0" />
    </section>
    <section data-testid="hole" :class="SECTION">
      <HoleBackground class="absolute inset-0" />
    </section>
    <section data-testid="stars" :class="SECTION">
      <StarsBackground class="absolute inset-0" />
    </section>
    <section data-testid="bubble-children" :class="SECTION">
      <BubbleBackground class="absolute inset-0">
        <button data-testid="bubble-child">Click</button>
      </BubbleBackground>
    </section>
    <section data-testid="gravity-stars-children" :class="SECTION">
      <GravityStarsBackground class="absolute inset-0">
        <button data-testid="gravity-stars-child">Click</button>
      </GravityStarsBackground>
    </section>
    <section data-testid="hexagon-children" :class="SECTION">
      <HexagonBackground class="absolute inset-0">
        <button data-testid="hexagon-child">Click</button>
      </HexagonBackground>
    </section>
    <section data-testid="hole-children" :class="SECTION">
      <HoleBackground class="absolute inset-0">
        <button data-testid="hole-child">Click</button>
      </HoleBackground>
    </section>
    <section data-testid="hexagon-tight" :class="SECTION">
      <div class="absolute inset-0 text-[8px] leading-none">
        <HexagonBackground class="absolute inset-0" />
      </div>
    </section>
    <section data-testid="stars-color" :class="SECTION">
      <Toggled v-slot="{ on }">
        <StarsBackground class="absolute inset-0" :star-color="on ? '#ff0000' : '#fff'" />
      </Toggled>
    </section>
    <section data-testid="fireworks-color" :class="SECTION">
      <Toggled v-slot="{ on }">
        <FireworksBackground class="absolute inset-0" :color="on ? '#ff0000' : '#0000ff'" />
      </Toggled>
    </section>
    <section data-testid="topography" :class="SECTION">
      <TopographyBackground class="absolute inset-0" />
    </section>
    <section data-testid="topography-red" :class="SECTION">
      <TopographyBackground class="absolute inset-0" line-color="#ff0000" />
    </section>
  </div>
</template>
