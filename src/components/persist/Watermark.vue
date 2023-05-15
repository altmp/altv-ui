<script setup lang="ts">
import {useUIStore} from "@/stores/ui";
import {useConnectionStateStore} from "@/stores/connectionState";
import {useVersionStore} from "@/stores/version";

const ui = useUIStore();
const version = useVersionStore();
const connection = useConnectionStateStore();
</script>

<template>
    <section>
        <div class="watermark" :class="ui.watermarkPosition" :data-visible="!ui.ready || !ui.opened && connection.connected">
            <span>{{version.orange ? "GTA:Orange" : "alt:V Multiplayer"}}</span>
        </div>
    </section>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

section {
    font-size: 16px;
}

.watermark {
    pointer-events: none;
    position: fixed;
    color: rgba(255, 255, 255, 0.75);
    font-weight: 500;
    padding: 2em;
    font-size: 0.9em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    z-index: 201;

    opacity: 0;
    transition: opacity 0.2s ease-in-out;

    &[data-visible=true] {
        opacity: 1;
    }
}
.watermark.topleft {
    top: 0.2em;
    left: 0.2em;
}
.watermark.topright {
    top: 0.2em;
    right: 0.2em;
}
.watermark.bottomright {
    bottom: 0;
    right: 0;
}
.watermark.bottomcenter {
    bottom: 0.2em;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
}
.watermark.topcenter {
    top: 0.2em;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
}
</style>