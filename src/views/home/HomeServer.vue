<script lang="ts" setup>
import type {ComputedRef, PropType} from "vue";
import {computed} from "vue";
import BlockContainer from "@/components/container/BlockContainer.vue";
import type {IHistoryServer} from "@/types/IHistoryServer";
import {useServersStore} from "@/stores/servers";
import {useLocalization} from "@/stores/localization";
import {ModalType, useModalStore} from "@/stores/modal";
import type {IServer} from "@/types/IServer";
import Star from "@/components/icons/Star.vue";
import {useVersionStore} from "@/stores/version";

const version = useVersionStore();
const servers = useServersStore();
const modal = useModalStore();
const { t } = useLocalization();
const props = defineProps({
    server: { type: Object as PropType<IHistoryServer>, required: true }
});

const fullData = computed(() => props.server.id != null ? servers.getServer(props.server.id) : undefined);

const name = computed(() => fullData.value?.name ?? props.server.name);
const invalidBranch = computed(() => version.branch != 'internal' && version.branch != fullData.value?.branch);

function open() {
    if (fullData.value) {
        modal.open(ModalType.Connect, { server: fullData.value }, true);
    } else if(props.server.url) {
        modal.open(ModalType.DirectConnect, { address: props.server.url }, true)
    } else if(props.server.id) {
        modal.open(ModalType.DirectConnect, { address: '@' + props.server.id }, true);
    }
}
</script>

<template>
    <block-container class="server__frame" :class="{ 'server__frame--offline': !fullData && !server.url }" @click="open">
        <div class="server__name">
            {{ name }}
        </div>

        <template v-if="server.id">
            <div v-if="!fullData" class="server__players server__players--offline">{{ t('OFFLINE') }}</div>
            <div v-else-if="invalidBranch" class="server__players server__players--offline">Invalid branch</div>
            <div v-else class="server__players server__players--online" dir="ltr">
                {{ fullData.playersCount }} <span>/ {{ fullData.maxPlayersCount }}</span>
            </div>
        </template>
    </block-container>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';
@import '@/assets/_palette.scss';

.server {
    &__name {
        font-weight: 500;
        opacity: 0.75;
        flex: 1;
        white-space: nowrap;
        overflow-x: hidden;
        overflow-y: visible;
        text-overflow: ellipsis;
        transition: opacity 0.2s ease-in-out;
        height: 100%;
        padding-top: u(20);
        padding-bottom: u(20);
    }

    &__players {
        font-weight: 500; // 600 in figma
        font-size: u(16);

        &--online {
            color: $text_light;

            span {
                font-size: u(14);
                color: rgba($text_light, 0.5);
            }
        }

        &--offline {
            color: rgba($text_light, 0.5);
        }
    }

    &__frame {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: u(16);
        line-height: 1;
        gap: u(16);
        cursor: pointer;
        padding-top: 0;
        padding-bottom: 0;

        &:hover {
            .server__name {
                opacity: 1;
            }
        }

        &--offline {
            opacity: 0.5;
            pointer-events: none;

            .server__name {
                opacity: 1;
            }
        }
    }
}
</style>