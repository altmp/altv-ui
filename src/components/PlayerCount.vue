<script setup lang="ts">
defineProps({
    online: Boolean,
    players: Number,
    maxPlayers: Number,
})
</script>

<template>
    <p v-if="online" class="player-count__online">{{ players }} <span>/ {{ maxPlayers }}</span></p>
    <p v-else class="player-count__offline">Offline</p>
</template>

<style scoped lang="scss">
@import '@/assets/_palette.scss';
@import '@/assets/_util.scss';

p.player-count__online {
    font-weight: 500; // 600 in figma
    font-size: u(16);
    color: $text_light;
    margin: 0;

    span {
        font-weight: 500;
        font-size: u(14);
        color: rgba($text_light, 0.5);
    }
}

p.player-count__offline {
}
</style>