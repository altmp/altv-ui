
<script lang="ts" setup>
import {useSettingsStore} from "@/stores/settings";
import AltCheckbox from "../../components/form/AltCheckbox.vue";
import AltInput from "../../components/form/AltInput.vue";
import AltDropdown from "@/components/form/AltDropdown.vue";
import {useLocalization} from "@/stores/localization";
import {ref} from "vue";
import AltButton from "@/components/AltButton.vue";
import AltSlider from "@/components/form/AltSlider.vue";

const settings = useSettingsStore();
const locale = useLocalization();

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

const { t } = locale;
</script>

<template>
    <div class="menu__group">
        <h3>{{ t('NICKNAME') }}</h3>
        <alt-input v-model="settings.data.name" @change="settings.save('name')"></alt-input>
    </div>

    <div class="menu__group">
        <h3>{{ t('LANGUAGE') }}</h3>
        <alt-dropdown v-model="settings.data.language"
                      :elements="[...locale.locales.values()].map(e => ({ value: e.code, label: e.name }))" @change="settings.save('language')"></alt-dropdown>
        <alt-checkbox v-model="settings.data.disableRtl" v-if="locale.currentLocale.rtl" @change="settings.save('disableRtl')" :label="t('DISABLE_RTL')"></alt-checkbox>
    </div>

    <div class="menu__group">
        <h3>{{ t('REGION') }}</h3>
        <alt-dropdown v-model="settings.data.region" :elements="regions" @change="settings.save('region')"></alt-dropdown>
    </div>

    <alt-slider v-model="settings.data.uiVolume" @change="settings.save('uiVolume')" :label="t('UI_VOLUME')"></alt-slider>

    <div class="menu__group">
        <h3>{{ t('DOWNLOAD_SPEED_LIMIT') }}</h3>
        <alt-input v-model="speedLimit" :placeholder="t('UNLIMITED')" @keydown.enter="saveSpeedLimit" @blur="saveSpeedLimit"></alt-input>
    </div>

    <div class="menu__group">
        <h3>{{ t('SERVERLIST') }}</h3>
        <alt-checkbox v-model="settings.data.promotedOnTop" @change="settings.save('promotedOnTop')" :label="t('PROMOTED_ON_TOP')"></alt-checkbox>
    </div>

    <div class="menu__group">
        <h3>{{ t('DEBUG') }}</h3>
        <alt-checkbox v-model="settings.data.netgraphEnabled" @change="settings.save('netgraphEnabled')" :label="t('NETGRAPH')"></alt-checkbox>
        <alt-checkbox v-model="settings.data.useExternalConsole" @change="settings.save('useExternalConsole')" :label="t('USE_EXTERNAL_CONSOLE')"></alt-checkbox>
        <alt-checkbox v-model="settings.data.crashReporterEnabled" @change="settings.save('crashReporterEnabled')" :label="t('CRASH_REPORTER_ENABLED')"></alt-checkbox>
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