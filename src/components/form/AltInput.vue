<script setup lang="ts">
import {ref} from "vue";
import { playHoverSound, playClickSound } from "@/utils/playSound";

const props = defineProps<{ modelValue: string, pattern?: RegExp }>();
const input = ref<HTMLInputElement>();

const emit = defineEmits(['update:modelValue']);

function onInput(event: Event) {
    const el = (event.currentTarget! as HTMLInputElement);
    if (props.pattern && el.value.match(props.pattern)) {
        el.value = el.value.replace(props.pattern, '');
    }
    emit('update:modelValue', el.value);
}

function focus() {
    input.value?.focus();
}

defineExpose({ focus });
</script>

<template>
    <div class="wrapper" @mouseenter="playHoverSound" @click="playClickSound">
        <div class="icon">
            <slot></slot>
        </div>
        <input v-bind="$attrs" v-bind:value="modelValue" @input="onInput" ref="input" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';

.wrapper {
    position: relative;
    width: 100%;
    height: u(50);

    .icon {
        position: absolute;
        height: u(50);
        display: flex;
        align-items: center;
        left: u(16);
        color: #b1b1b1;

        :deep(svg) {
            height: u(18);
            width: u(18)
        }

        &:not(:empty) + input {
            padding-left: u(16 + 18 + 16);
        }
    }
}

input {
    width: 100%;
    height: u(50);
    background: rgba(241, 242, 242, 0.02);
    border: u(1) solid rgba(241, 242, 242, 0.1);
    border-radius: u(8);
    padding: u(16);
    font-weight: 400;
    text-decoration: none;
    color: #F1F2F2;
    font-size: u(18);
    font-family: 'Inter', Tahoma, sans-serif;
    unicode-bidi: plaintext;

    [dir=rtl] & {
        text-align: right;
    }

    &:focus {
        outline: none;
    }

    &::placeholder {
        color: rgba(#F1F2F2, 0.6);
        font-weight: 400;
    }
}
</style>