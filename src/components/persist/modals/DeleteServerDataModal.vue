<script setup lang="ts">

import {getModalProps, ModalType, useModalStore} from "@/stores/modal";
import AltButton from "@/components/AltButton.vue";
import {formatBytes} from "@/utils/formatBytes";
import {useConnectionStateStore} from "@/stores/connectionState";
import {watch} from "vue";
import {useLocalization} from "@/stores/localization";
import {ServerDataType, useServersStore} from "@/stores/servers";

const connectionState = useConnectionStateStore();
const modal = useModalStore();
const servers = useServersStore();
const modalProps = getModalProps<ModalType.DeleteServerData>(modal);
const { t } = useLocalization();
const canDelete = modalProps.value.id != connectionState.connectedServerId;

if (connectionState.active) modal.close();
watch(() => connectionState.active, () => connectionState.active && modal.close());

function confirm() {
    servers.deleteServerData(modalProps.value.id, modalProps.value.type);
    modal.close();
}

function cancel() {
    modal.close();
}

</script>

<template>
    <div class="modal">
        <div class="modal__header">
            <div class="modal__title">{{ t(modalProps.type === ServerDataType.Resources ? 'DELETE_RESOURCES_HEADER' : 'DELETE_DATA_HEADER') }}</div>
            <div class="modal__server">{{modalProps.name}}</div>
        </div>
        <div class="modal__content" v-if="!canDelete">{{ t('CANNOT_DELETE_CURRENT_SERVER_DATA') }}</div>
        <div class="modal__content" v-else>{{ t(modalProps.type === ServerDataType.Resources ? 'CONFIRM_RESOURCE_DELETE' : 'CONFIRM_DATA_DELETE', formatBytes(modalProps.size)) }}</div>
        <div class="modal__actions">
            <div class="modal__buttons">
                <alt-button color="green" @click="confirm" v-if="canDelete">{{ t('CONFIRM') }}</alt-button>
                <alt-button color="red" @click="cancel">{{ t('CANCEL') }}</alt-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_palette.scss';

.modal {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: u(64);

    &__header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: u(24);
    }

    &__title {
        font-size: u(48);
        font-weight: 600;
        color: $text_light;
    }

    &__server {
        font-size: u(24);
        font-weight: 500;
        color: rgba(white, 0.75);
    }


    &__content {
        font-size: u(18);
        text-align: center;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    &__permissionGroups {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: u(48);

        .permissions {
            font-size: u(18);

            &__title {
                margin-bottom: u(24);
                text-align: center;
                font-weight: 500;
                font-size: u(16);
                color: rgba($text_light, 0.5);
            }

            &__list {
                * + * {
                    margin-top: u(16);
                }
            }

            &--required .permissions__list {
                opacity: 0.5;
                pointer-events: none;
            }
        }
    }

    &__actions a {
        display: block;
        margin-top: u(24);
        text-align: center;
        color: rgba(white, 0.5);
        line-height: u(16);
        font-size: u(16);
    }

    &__buttons {
        display: flex;
        gap: u(24);
        font-size: u(18);
    }
}
</style>