<script setup lang="ts">
import {DynamicScroller} from 'vue-virtual-scroller'
import {onMounted, ref, watch} from "vue";
import {useLogStore} from "@/stores/console";
import ConsoleEntry from "@/components/persist/console/ConsoleEntry.vue";

const atBottom = ref(true);
const scroller = ref<any | null>(null);
const log = useLogStore();

function onScroll(e: UIEvent, add = 0) {
    const target = e.currentTarget as HTMLElement;
    atBottom.value = target.scrollTop + add >= target.scrollHeight - target.clientHeight;
}

function onWheel(e: WheelEvent) {
    onScroll(e, e.deltaY);
}

function onMouseUp(e: MouseEvent) {
    onScroll(e);
}

function onMouseDown(e: MouseEvent) {
    const target = e.currentTarget as HTMLDivElement;
    if (e.offsetX > target.clientWidth - 3)
    {
        atBottom.value = false;
    }
}

watch(log, () => {
    if (atBottom.value) scroller.value?.scrollToBottom();
});

async function scrollDown() {
    atBottom.value = true;
    scroller.value?.scrollToBottom();
}

defineExpose({ scrollDown });

onMounted(async () => {
    scrollDown();
});

function scrollEnd() {
    if (atBottom.value) scrollDown();
}

const itemSize = Math.floor(window.innerHeight / 1080 * 35);
</script>

<template>
    <div class="console-output">
        <DynamicScroller
            :items="log.entries"
            :min-item-size="itemSize"
            class="scroller"
            ref="scroller"
            @wheel="onWheel"
            @mouseup="onMouseUp"
            @mousedown="onMouseDown"
            :emitResize="true"
            @scroll-end="scrollEnd"
        >
            <template #default="{ item, index, active }">
                <console-entry :item="item" :index="index" :active="active" />
            </template>
        </DynamicScroller>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";
@import "@/assets/_palette.scss";

.console-output {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: calc(100% - #{u(35)});
    width: 100%;
    margin: 0;
    user-select: text;
    font-size: u(15);
    word-break: break-word;
}

.scroller {
    height: 100%;
    //noinspection CssInvalidPropertyValue
    overflow-y: overlay !important;

    &::-webkit-scrollbar {
        width: u(3);
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: u(0);
        background: none;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.5);
        border-radius: u(0);
    }
}

</style>