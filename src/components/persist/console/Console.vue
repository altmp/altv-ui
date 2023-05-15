<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import ConsoleOutput from "@/components/persist/console/ConsoleOutput.vue";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import Maximize from "@/components/icons/Maximize.vue";
import Minimize from "@/components/icons/Minimize.vue";
import Tooltip from "@/components/container/Tooltip.vue";
import File from "@/components/icons/File.vue";
import ArrowDown from "@/components/icons/ArrowDown.vue";
import {useLogStore} from "@/stores/console";
import Delete from "@/components/icons/Delete.vue";
import {useSettingsStore} from "@/stores/settings";
import {useLocalization} from "@/stores/localization";
import Border from "@/components/icons/Border.vue";
import {clamp} from "@/utils/clamp";

const settings = useSettingsStore();
const command = ref("");
const historyIndex = ref(-1);
const content = ref<typeof ConsoleOutput | null>(null);
const input = ref<HTMLDivElement>();
const consoleRef = ref<HTMLDivElement>();

const log = useLogStore();
const { t } = useLocalization();

function moveHistory(mod: number) {
    const newIndex = Math.min(Math.max(historyIndex.value + mod, -1), log.history.length - 1);
    if (historyIndex.value != newIndex) historyIndex.value = newIndex;
}

function update(event: Event) {
    historyIndex.value = -1;
    command.value = (event.target as HTMLInputElement).value;
}

function execute() {
    const value = historyIndex.value == -1 ? command.value : log.history[historyIndex.value];
    if (!value.trim()) return;

    log.addHistoryEntry(value);
    alt.emit('console:execute', value);

    command.value = "";
    historyIndex.value = -1;
}

function openLogFile() {
    alt.emit('console:openLogFile');
}

watch(() => log.open, () => {
    nextTick(() => {
        content?.value?.scrollDown();
        input.value?.focus()
    });
});

const transparent = computed(() => {
    return log.transparent && !log.open;
})

function startResize(vertical: boolean, horizontal: boolean) {
    let lastHeight = 0;
    let lastWidth = 0;

    function mouseMove(event: MouseEvent) {
        if (!consoleRef.value) return;
        if (vertical) {
            const percent = clamp(event.clientY / window.innerHeight, 0.2, 0.9);
            consoleRef.value!.style.height = percent * 100 + '%';
            lastHeight = percent;
        }
        if (horizontal) {
            const percent = clamp((window.innerWidth - event.clientX) / window.innerWidth, 0.2, 0.9);
            consoleRef.value!.style.width = percent * 100 + '%';
            lastWidth = percent;
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', stopResize);
        consoleRef.value?.classList.remove('console--resizing-v');
        consoleRef.value?.classList.remove('console--resizing-h');

        if (lastHeight != 0) {
            settings.data.consoleHeight = lastHeight;
            settings.save('consoleHeight');
        }

        if (lastWidth != 0) {
            settings.data.consoleWidth = lastWidth;
            settings.save('consoleWidth');
        }
    }

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', stopResize);
    if (consoleRef.value) {
        if (vertical) consoleRef.value!.classList.add('console--resizing-v');
        if (horizontal) consoleRef.value!.classList.add('console--resizing-h');
    }
}

</script>

<template>
    <div class="console-container" dir="ltr" v-if="log.open || transparent" :class="{ ['console-container--big']: settings.data.expandedConsole, transparent: transparent }">
        <div class="actions" v-if="log.open || transparent" :data-hidden="transparent">
            <tooltip :text="t(settings.data.expandedConsole ? 'SHRINK' : 'EXPAND')" :alignment="settings.data.expandedConsole ? 'left' : undefined">
                <div class="actions__action" @click="settings.toggleConsole()">
                    <minimize v-if="settings.data.expandedConsole"/>
                    <maximize v-else/>
                </div>
            </tooltip>
            <tooltip :text="t('OPEN_LOG_FILE')">
                <div class="actions__action" @click="openLogFile">
                    <file/>
                </div>
            </tooltip>
            <tooltip :text="t('CLEAR_LOGS')">
                <div class="actions__action" @click="log.clearLogs()">
                    <delete/>
                </div>
            </tooltip>
            <tooltip :text="t('SCROLL_DOWN')">
                <div class="actions__action" @click="content?.scrollDown()">
                    <arrow-down/>
                </div>
            </tooltip>
            <tooltip :text="t('SEMI_TRANSPARENT_MODE')">
                <div class="actions__action" :data-active="log.transparent" @click="log.enableTransparentMode()">
                    <border/>
                </div>
            </tooltip>
        </div>
        <div class="console" ref="consoleRef" v-if="log.open || transparent"
             :style="{
                height: clamp(settings.data.consoleHeight, 0.2, 0.9) * 100 + 'vh',
                width: clamp(settings.data.consoleWidth, 0.2, 0.9) * 100 + 'vw',
             }"
        >
            <ConsoleOutput class="console__output" ref="content" />

            <div class="console__inputRow">
                <span class="console__mark">&gt;</span>
                <input
                    ref="input"
                    type="text"
                    name="cmd"
                    autocomplete="off"
                    :value="historyIndex === -1 ? command : log.history[historyIndex]"
                    :disabled="transparent"
                    @input="update"
                    @keydown.enter.prevent="execute"
                    @keydown.up.prevent="moveHistory(1)"
                    @keydown.down.prevent="moveHistory(-1)"
                />
            </div>

            <div class="console__resize-v" @mousedown="startResize(true, false)"></div>
            <div class="console__resize-h" v-if="!settings.data.expandedConsole" @mousedown="startResize(false, true)"></div>
            <div class="console__resize-corner" v-if="!settings.data.expandedConsole" @mousedown="startResize(true, true)"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";
@import "@/assets/_palette.scss";


.actions {
    display: flex;
    flex-direction: column;
    gap: u(10);
    opacity: 1;
    transition: opacity 0.1s ease;

    &[data-hidden=true] {
        opacity: 0;
    }

    &__action {
        padding: 1em;
        display: flex;
        justify-content: center;
        align-items: center;
        aspect-ratio: 1 / 1;
        background: rgba(darken($back_black, 2), 1);
        border: solid u(1) rgba($text_light, 0.2);
        border-radius: u(8);
        fill: rgba(255, 255, 255, 0.8);
        transition: color 0.2s;
        cursor: pointer;

        &[data-active=true] {
            background: rgba(lighten($back_black, 2), 1);
            border-color: rgba($text_light, 0.4);
        }

        svg {
            width: u(20);
            height: u(20);
        }

        &:hover {
            fill: rgba(255, 255, 255, 1);
        }
    }
}

.console-container {
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    position: absolute;
    background: rgba(16, 16, 16, .8);
    //opacity: 1;
    //transition: opacity 0.1s ease;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: u(10);
    z-index: 100;

    //&:not(.visible) {
    //    opacity: 0;
    //    pointer-events: none;
    //}

    &.transparent {
        background: transparent;
        opacity: 0.7;
        pointer-events: none;
    }

    &--big {
        flex-direction: column-reverse;

        .actions {
            flex-direction: row;
        }

        .console {
            width: 100vw !important;
            height: 50vh;
            border-radius: 0;
        }
    }
}

.console {
    height: 40vh;
    width: 45vw;
    background: rgba(darken($back_black, 2), 1);
    border: solid u(1) rgba($text_light, 0.2);
    font-family: 'Jetbrains Mono', monospace;
    font-weight: 300;
    border-radius: 0 0 0 u(8);
    transition: border-color 0.2s ease;

    ::selection {
        background: rgba(93, 93, 93, 0.4);
        color: inherit;
    }

    &__output {
    }

    &__inputRow {
        width: 100%;
        height: u(35);
        display: flex;
        border-top: solid u(1) rgba($text_light, 0.2);
    }

    &__mark {
        font-size: u(14);
        font-weight: 300;
        height: 100%;
        line-height: u(34);
        padding-left: u(13);
        padding-right: u(10);
    }

    input {
        flex: 1;
        height: 100%;
        border: 0;
        box-sizing: border-box;
        background: none;
        color: #fff;
        padding: u(10) u(20) u(10) 0;
        font-family: 'Jetbrains Mono', monospace;
        font-weight: 300;
        font-size: u(14);
    }

    &__actions {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: -5em;
        gap: u(20);
    }

    &--big &__extend {
        top: calc(100% + #{u(10)});
        left: 0;
    }

    &__resize-v {
        width: 100%;
        height: u(10);
        position: absolute;
        bottom: u(-8);
        left: 0;
        cursor: n-resize;
    }

    &__resize-h {
        width: u(10);
        height: 100%;
        position: absolute;
        left: u(-8);
        top: 0;
        cursor: e-resize;
    }

    &__resize-corner {
        width: u(14);
        height: u(14);
        position: absolute;
        left: u(-8);
        bottom: u(-8);
        cursor: ne-resize;
    }

    &:has(&__resize-v:hover), &:has(&__resize-corner:hover) {
        border-bottom-color: rgba($text_light, 0.4);
    }

    &:has(&__resize-h:hover), &:has(&__resize-corner:hover) {
        border-left-color: rgba($text_light, 0.4);
    }

    &.console--resizing-v {
        border-bottom-color: rgba($text_light, 0.6) !important;
    }

    &.console--resizing-h {
        border-left-color: rgba($text_light, 0.6) !important;
    }
}
</style>