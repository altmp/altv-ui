<script setup lang="ts">
import BlockContainer from '@/components/container/BlockContainer.vue';
import {formatBytes} from "@/utils/formatBytes";
import {formatTime} from "@/utils/formatTime";
import {ModalType, useModalStore} from "@/stores/modal";
import {useLocalization} from "@/stores/localization";
import { playErrorSound } from "@/utils/playSound";

const props = defineProps<{
    id: string;
    name: string;
    lastVisit: number;
    resourcesSize: number;
    dataSize: number;
}>();
const modal = useModalStore();

function deleteData(type: number) {
    modal.open(ModalType.DeleteServerData, { id: props.id, type, size: type === 0 ? props.resourcesSize : props.dataSize, name: props.name });
    playErrorSound();
}

const { t } = useLocalization();
</script>

<template>
    <block-container class="server">
        <div class="server__server-info">
            <div class="server__server-name">
                {{ props.name }}
            </div>
            <div class="server__server-usage">
                <span>{{ t('RESOURCES_SIZE', formatBytes(props.resourcesSize)) }}</span>
                <span>{{ t('DATA_SIZE', formatBytes(props.dataSize)) }}</span>
                <span>{{ t('LAST_VISIT', formatTime(props.lastVisit)) }}</span>
            </div>
        </div>
        <div class="server__server-actions">
            <a class="server__server-action" @click="deleteData(0)">
                {{ t('DELETE_RESOURCES') }}
            </a>
            <a class="server__server-action" @click="deleteData(1)">
                {{ t('DELETE_DATA') }}
            </a>
        </div>
    </block-container>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';


.server {
    display: flex;
    font-size: u(16);
    outline: none !important;
    transform: none !important;

    + * {
        margin-top: u(16);
    }

    &__server-info {
        display: flex;
        flex-direction: column;
        gap: u(12);
        flex: 1;
    }

    &__server-name {
        font-weight: 500; // 600 in figma
        line-height: u(16);
        unicode-bidi: plaintext;
    }

    &__server-usage {
        color: rgba(white, 0.5);
        display: flex;
        gap: u(12);
        font-size: u(14);
        line-height: u(14);
        flex-wrap: wrap;
    }

    &__server-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        column-gap: u(24);
        flex-wrap: wrap;
        max-width: 40%;
    }

    &__server-action {
        cursor: pointer;
        height: max-content;
    }
}
</style>