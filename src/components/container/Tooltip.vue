<script setup lang="ts">
const props = defineProps({
    text: String,
    alignment: String,
    position: String
})
</script>

<template>
    <div class="tooltip-element" v-bind="$attrs" :data-position="props.position">
        <slot></slot>
        <div class="tooltip-value" :class="{ [alignment ?? 'center']: true }">
            {{ props.text }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_palette.scss';

.tooltip-element {
    position: relative;

    .tooltip-value {
        position: absolute;
        left: 50%;
        white-space: nowrap;
        margin-top: u(8);
        font-weight: 500;
        font-size: u(12);
        background: #202020;
        padding: u(6);
        border: solid u(1) rgba(white, 0.1);
        border-radius: u(4);
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
        transition-delay: 0s;
        opacity: 0;
        transform: translateX(-50%);
        line-height: 1.2;
        color: $text_light;

        &.left {
            transform: none;
            left: 0;
        }

        &.right {
            transform: none;
            left: unset;
            right: 0;
        }

        z-index: 10;
    }

    &[data-position=right] {
        .tooltip-value {
            margin: 0;
            top: 50%;
            right: u(-16);
            transform: translate(100%, -50%);
            left: unset;
            font-size: u(14);
        }
    }

    &:hover {
        > .tooltip-value {
            opacity: 1;
            transition-delay: 0.15s;
        }
    }
}
</style>