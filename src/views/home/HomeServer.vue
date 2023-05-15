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

const servers = useServersStore();
const modal = useModalStore();
const { t } = useLocalization();
const props = defineProps({
    server: { type: Object as PropType<IHistoryServer>, required: true }
});

type DataType = (IServer & { direct?: boolean; offline?: boolean; name: string; url?: string });

const data: ComputedRef<DataType> = computed((): DataType => {
    const fullData: any =
        props.server.id !== undefined &&
        servers.servers.find((s: any) => s.id == props.server.id);

    if (props.server.url) {
        return (
            fullData || {
                direct: true,
                name: props.server.name,
                url: props.server.url
            }
        );
    } else {
        return (
            fullData || {
                offline: true,
                name: props.server.name
            }
        );
    }
});

function open() {
    if (props.server.id) {
        const server = servers.servers.find(e => e.id == props.server.id);
        if (!server) return;

        modal.open(ModalType.Connect, { server }, true);
    } else {
        modal.open(ModalType.DirectConnect, { address: props.server.url })
    }
}

// todo a way to unfavorite offline servers
</script>

<template>
    <block-container class="server__frame" :class="{ 'server__frame--offline': data.offline !== undefined }" @click="open">
        <div class="server__name">
            {{ data.name }}
        </div>

        <template v-if="!data.direct">
            <div v-if="data.offline !== undefined" class="server__players server__players--offline">{{ t('OFFLINE') }}</div>
            <div v-if="data.offline === undefined" class="server__players server__players--online" dir="ltr">
                {{ data.players }} <span>/ {{ data.maxPlayers }}</span>
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