<script setup lang="ts">

import AltButton from "@/components/AltButton.vue";
import AltInput from "@/components/form/AltInput.vue";
import {ref} from "vue";
import {getModalProps, ModalType, useModalStore} from "@/stores/modal";
import {useConnectionStateStore} from "@/stores/connectionState";
import {useLocalization} from "@/stores/localization";
import {useVersionStore} from "@/stores/version";

const connection = useConnectionStateStore();
const modal = useModalStore();
const version = useVersionStore();
const props = getModalProps<ModalType.DirectConnect>(modal);
const { t } = useLocalization();

const address = ref(props.value.address ?? version.lastIp);
const password = ref(props.value.password ?? "");

function connect() {
    connection.setServer(address.value);
    version.updateLastIp(address.value);
    if (address.value.match(/^https?:\/\//)) {
        alt.emit('connection:connect', '', 0, address.value, '', password.value, '', address.value, false);
    } else {
        let host: string, port = 0;
        const data = address.value.match(/^(\[.*?]|[^:]+):?(\d+)?$/mi);
        if (data) {
            host = data[1];
            port = +data[2] || 0;
        } else {
            host = address.value;
        }

        if (host.startsWith("[") && host.endsWith("]")) host = host.substring(1, host.length - 1);

        alt.emit('connection:connect', host, port, '', '', password.value, '', address.value);
    }
    modal.close();
}
</script>

<template>
    <div class="direct-connect">
        <div class="direct-connect__content">
            <div class="direct-connect__title">
                {{ t('DIRECT_CONNECT') }}
            </div>
            <div class="direct-connect__rows">
                <div class="direct-connect__actions">
                    <alt-input class="direct-connect__ip" @keydown.enter.stop="connect" v-model="address" type="text" :placeholder="t('SERVER_ADDRESS')" autocomplete="off"></alt-input>
                </div>
                <div class="direct-connect__actions">
                    <alt-input class="direct-connect__password" @keydown.enter.stop="connect" v-model="password" type="password" :placeholder="t('PASSWORD_IF_NEEDED')" autocomplete="off"></alt-input>
                    <alt-button color="primary" @click="connect">{{ t('CONNECT') }}</alt-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_palette.scss';

.direct-connect {
    //min-width: u(500);
    border-radius: u(8);
    border: solid u(2) rgba($text_light, 0.05);
    background: $back_black;
    display: flex;
    overflow: hidden;
    font-family: Inter, sans-serif;

    &__content {
        flex: 1;
        padding: u(32);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: u(24);
        justify-content: space-between;
    }

    &__title {
        text-align: center;
        font-size: u(28);
        line-height: 120%;
        gap: u(20);
        font-weight: 500;
        color: white;
    }

    &__rows {
        display: flex;
        flex-direction: column;
        gap: u(15);
    }

    &__ip, &__password {
        width: u(310);
    }

    &__actions :deep(input) {
        padding-top: u(16);
        padding-bottom: u(16);
    }

    &__actions {
        font-size: u(18);
        display: flex;
        justify-content: flex-start;
        line-height: 1;
        gap: u(16);
    }
}
</style>