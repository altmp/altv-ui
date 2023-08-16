<script lang="ts" setup>
import type {PropType} from "vue";
import type {IHistoryServer} from "@/types/IHistoryServer";
import HomeServer from "@/views/home/HomeServer.vue";

defineProps({
    servers: { type: Array as PropType<IHistoryServer[]>, required: true }
});

</script>

<template>
    <div v-if="servers.length > 0" class="servers">
        <home-server v-for="server in servers" :server="server" />
    </div>
    <div v-if="servers.length === 0" class="servers--empty">
        <slot name="empty"></slot>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';
@import '@/assets/_palette.scss';

.servers {
    display: flex;
    flex-direction: column;
    gap: u(16);

    &--empty {
        :deep(div) {
            display: inline-block;
            font-size: u(32);
            font-weight: 500;
            line-height: 140%;
        }

        :deep(svg) {
            height: u(32);
            width: u(33);
            stroke: $text_light;
            fill: $text_light;
            vertical-align: -0.17em;
            cursor: pointer;

            &.star {
                height: u(28);
                cursor: default;
                vertical-align: -0.05em;
            }
        }
    }
}
</style>