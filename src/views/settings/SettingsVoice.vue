
<script lang="ts" setup>
import {useSettingsStore} from "@/stores/settings";

import AltSlider from "../../components/form/AltSlider.vue";
import AltCheckbox from "../../components/form/AltCheckbox.vue";
import AltKeyInput from "../../components/form/AltKeyInput.vue";
import {useLocalization} from "@/stores/localization";
import {watch} from "vue";
import {useUIStore} from "@/stores/ui";
import {useConnectionStateStore} from "@/stores/connectionState";
import VolumeDisplay from "@/components/VolumeDisplay.vue";

const ui = useUIStore();
const connection = useConnectionStateStore();
const settings = useSettingsStore();
const { t } = useLocalization();

watch(() => ui.ready && (ui.opened || !connection.connected) && settings.data.voiceActivation, (value, oldValue, onCleanup) => {
    alt.emit('settings:currentVolume:toggle', value);
    onCleanup(() => alt.emit('settings:currentVolume:toggle', false));
}, { immediate: true })
</script>

<template>
    <div>
        <h3>{{ t('PUSH_TO_TALK_KEY') }}</h3>
        <alt-key-input v-model="settings.data.voiceActivationKey" @change="settings.save('voiceActivationKey')"></alt-key-input>
    </div>
    <volume-display :value="settings.currentVolume" :label="t('Microphone test')"></volume-display>

    <alt-checkbox v-model="settings.data.voiceActivation" @change="settings.save('voiceActivation')" :label="t('VOICE_ACTIVATION')"></alt-checkbox>
    <alt-slider v-if="settings.data.voiceActivation" v-model="settings.data.voiceInputSensitivity" @change="settings.save('voiceInputSensitivity')" :label="t('INPUT_SENSITIVITY')"></alt-slider>
    <alt-slider v-model="settings.data.voiceVolume" @change="settings.save('voiceVolume')" :label="t('OUTPUT_VOLUME')"></alt-slider>
    <alt-checkbox v-model="settings.data.voiceAutoInputVolume" @change="settings.save('voiceAutoInputVolume')"
                  :label="t('AUTO_INPUT_VOLUME')"></alt-checkbox>
    <alt-slider v-if="!settings.data.voiceAutoInputVolume" v-model="settings.data.voiceInputVolume"
                @change="settings.save('voiceInputVolume')"
                :label="t('INPUT_VOLUME')"></alt-slider>
    <alt-checkbox v-model="settings.data.voiceNoiseSuppression" @change="settings.save('voiceNoiseSuppression')" :label="t('NOISE_SUPPRESSION')"></alt-checkbox>
</template>

<style lang="scss" scoped>

h3 {
    margin-bottom: u(16);
}

</style>