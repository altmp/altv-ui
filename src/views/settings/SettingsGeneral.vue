
<script lang="ts" setup>
import {useSettingsStore} from "@/stores/settings";
import AltCheckbox from "../../components/form/AltCheckbox.vue";
import AltInput from "../../components/form/AltInput.vue";
import AltDropdown from "@/components/form/AltDropdown.vue";
import {useLocalization} from "@/stores/localization";
import {ref, watch} from "vue";
import AltButton from "@/components/AltButton.vue";
import AltSlider from "@/components/form/AltSlider.vue";
import {useUIStore} from "@/stores/ui";
import {useConnectionStateStore} from "@/stores/connectionState";

const settings = useSettingsStore();
const locale = useLocalization();
const ui = useUIStore();
const connection = useConnectionStateStore();

function stringifySpeed(speed: number) {
    if (!speed) return '';
    return (speed / 1e3).toFixed(4).replace(/\.?0+$/, '');
}

function parseSpeed(speed: string) {
    return Math.floor((+speed || 0) * 1e3);
}


const speedLimit = ref(stringifySpeed(settings.data.downloadSpeedLimit));

// watch(() => settings.data.downloadSpeedLimit, (value) => {
//     speedLimit.value = String(value || '');
// });

function saveSpeedLimit() {
    const value = parseSpeed(speedLimit.value);
    settings.data.downloadSpeedLimit = value;
    settings.save('downloadSpeedLimit');
    speedLimit.value = stringifySpeed(value);
}

function resetSkin() {
    alt.emit('ui:resetSkin');
}

const regions = [
    {
        label: 'Global',
        value: 'global'
    },
    {
        label: 'Asia',
        value: 'asia'
    }
];
watch(() => ui.ready && (ui.opened || !connection.connected), (value, oldValue, onCleanup) => {
    alt.emit('settings:currentVolume:toggle', value);
    onCleanup(() => alt.emit('settings:currentVolume:toggle', false));
}, {immediate: true})

watch(() => ui.ready && (ui.opened || !connection.connected), (value, oldValue, onCleanup) => {
    alt.emit('settings:devices:reload');
    const interval = setInterval(() => alt.emit('settings:devices:reload'), 1000);
    onCleanup(() => clearInterval(interval));
}, {immediate: true})

const { t } = locale;
</script>

<template>
    <div class="menu__group">
        <h3>{{ t('NICKNAME') }}</h3>
        <alt-input :disabled="connection.active || connection.wasConnected" v-model="settings.data.name" @change="settings.save('name')"></alt-input>
    </div>

    <div class="menu__group">
        <h3>{{ t('LANGUAGE') }}</h3>
        <alt-dropdown v-model="settings.data.language"
                      :elements="[...locale.locales.values()].map(e => ({ value: e.code, label: e.name }))" @change="settings.save('language')"></alt-dropdown>
        <alt-checkbox v-model="settings.data.disableRtl" v-if="locale.currentLocale.rtl" @change="settings.save('disableRtl')" :label="t('DISABLE_RTL')"></alt-checkbox>
    </div>

    <div class="menu__group">
        <h3>{{ t('REGION') }}</h3>
        <alt-dropdown :disabled="connection.active || connection.wasConnected" v-model="settings.data.region" :elements="regions" @change="settings.save('region')"></alt-dropdown>
    </div>

    <alt-slider v-model="settings.data.uiVolume" @change="settings.save('uiVolume')" :label="t('UI_VOLUME')"></alt-slider>

    <div class="menu__group">
        <h3>{{ t('DOWNLOAD_SPEED_LIMIT') }}</h3>
        <alt-input v-model="speedLimit" :disabled="connection.inProgress" :placeholder="t('UNLIMITED')" @keydown.enter="saveSpeedLimit" @blur="saveSpeedLimit"></alt-input>
    </div>

    <div class="menu__group">
        <h3>{{ t('SERVERLIST') }}</h3>
        <alt-checkbox v-model="settings.data.promotedOnTop" @change="settings.save('promotedOnTop')" :label="t('PROMOTED_ON_TOP')"></alt-checkbox>
    </div>

    <div class="menu__group">
        <h3>{{ t('DEBUG') }}</h3>
        <alt-checkbox v-model="settings.data.netgraphEnabled" @change="settings.save('netgraphEnabled')" :label="t('NETGRAPH')"></alt-checkbox>
        <alt-checkbox v-model="settings.data.useExternalConsole" @change="settings.save('useExternalConsole')" :label="t('USE_EXTERNAL_CONSOLE')"></alt-checkbox>
    </div>

    <alt-button v-if="settings.data.launcherSkin !== ''" color="gray" @click="resetSkin">{{ t('RESTORE_DEFAULT_SKIN') }}</alt-button>
</template>

<style lang="scss" scoped>

h3 {
    margin-bottom: u(16);
}



.menu__group {
    > *:not(h3) {
        + * {
            margin-top: u(16);
        }
    }
}
</style>