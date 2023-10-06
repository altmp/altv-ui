<script setup lang="ts">
import AltButton from "@/components/AltButton.vue";
import {ProgressType, useConnectionStateStore} from "@/stores/connectionState";
import {computed, watch} from "vue";
import {formatBytes} from "@/utils/formatBytes";
import {useSettingsStore} from "@/stores/settings";
import {useLocalization} from "@/stores/localization";
import {useVersionStore} from "@/stores/version";
import {ModalType, useModalStore} from "@/stores/modal";
import {useRouter} from "vue-router";

const connectionState = useConnectionStateStore();
const settings = useSettingsStore();
const version = useVersionStore();
const modal = useModalStore();
const router = useRouter();
const { t, tArgsFromStrCtx } = useLocalization();

const progress = computed(() => {
    if (!connectionState.progressInBytes) {
        return [ connectionState.progressValue, connectionState.progressTotal ];
    }

    return [ formatBytes(connectionState.progressValue), formatBytes(connectionState.progressTotal) ];
});

const message = computed(() => tArgsFromStrCtx(connectionState.message ?? ''));

function abort() {
    connectionState.abort();
}

function disconnect() {
    alt.emit('connection:disconnect');
}

function reconnect() {
    alt.emit('connection:reconnect');
}

function openContext() {
    if (message.value.context)
        window.open(message.value.context);
}

watch(() => connectionState.active, (value) => {
    if (!value) router.push('/settings');
}, { immediate: true });
</script>

<template>
    <div class="connection">
        <div class="connection__info">
            <div class="connection__title">{{ t(connectionState.action) }}</div>
            <div class="connection__server">{{ connectionState.server }}</div>
        </div>
        <div class="connection__message" v-if="connectionState.message">{{ message.str }}</div>
        <div class="progress" v-if="connectionState.progressType !== ProgressType.None">
            <div class="progress__label">{{ t(connectionState.progressAction) }}</div>
            <div class="progress__bar" dir="ltr">
                <div v-if="connectionState.progressType === ProgressType.Determinate" class="progress__fill progress__fill--bg"></div>
                <div v-if="connectionState.progressType === ProgressType.Determinate" class="progress__fill"
                     :style="{ width: connectionState.progressValue / connectionState.progressTotal * 100 + '%' }"></div>
                <div v-if="connectionState.progressType === ProgressType.Indeterminate" class="progress__fill progress__fill--indeterminate"></div>
            </div>
            <div class="progress__status" v-if="connectionState.progressType === ProgressType.Determinate && !connectionState.progressHidden" :data-split="connectionState.progressSpeed != null">
                <span>{{ progress[0] }} / {{ progress[1] }}</span>
                <span v-if="connectionState.progressSpeed != null">{{ formatBytes(connectionState.progressSpeed) }}/s</span>
            </div>
        </div>
        <div class="connection__actions">
            <alt-button color="red" v-if="connectionState.cancelAction" @click="abort">{{ t(connectionState.cancelAction) }}</alt-button>
            <alt-button v-if="connectionState.showDisconnect" @click="disconnect">{{t('DISCONNECT')}}</alt-button>
            <alt-button v-if="connectionState.showReconnect && (settings.data.debug || version.branch === 'internal')" @click="reconnect">{{t('RECONNECT')}}</alt-button>
            <alt-button v-if="message.context != null" @click="openContext">{{t('VIEW_MORE')}}</alt-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

.connection {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    align-items: center;
    font-family: Inter, sans-serif;
    gap: u(64);

    &__info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: u(32);
    }

    &__title {
        color: #F1F2F2;
        font-size: u(48);
        font-weight: 600;
    }

    &__server {
        font-size: u(24);
        font-weight: 500;
        color: rgba(white, 0.75);
    }

    &__message {
        font-size: u(18);
        white-space: pre-line;
        text-align: center;
        line-height: 1.6
    }

    .progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: u(24);
        position: relative;

        &__label {
            color: rgba(white, 0.5);
            font-size: u(18);
            font-weight: 500;
        }

        &__bar {
            width: u(320);
            height: u(8);
            border-radius: u(100);
            background: #262626;
            overflow: hidden;
        }

        &__fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #F1F2F2;
            border-radius: u(100);
            transition: width 0.2s linear;

            &--indeterminate, &--bg {
                $width: 50%;
                width: $width;

                @keyframes indeterminate-progress {
                    0% { margin-left: -$width - 1% }
                    100% { margin-left: 101% }
                }

                animation: indeterminate-progress 1.5s infinite ease-in-out;
            }

            &--bg {
                opacity: 0.15;
            }
        }

        &__status {
            display: flex;
            min-width: u(320);
            color: #F1F2F2;
            font-size: u(16);
            justify-content: center;

            &:empty {
                display: none;
            }

            &[data-split=true] {
                justify-content: space-between;
            }
        }
    }

    &__actions {
        font-size: u(18);
        display: flex;
        gap: u(16);

        //> * {
        //    width: u();
        //}
    }
}
</style>