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
import AltDropdown from "@/components/form/AltDropdown.vue";
import AltButton from "@/components/AltButton.vue";
import Refresh from "@/components/icons/Refresh.vue";

const ui = useUIStore();
const connection = useConnectionStateStore();
const settings = useSettingsStore();
const {t} = useLocalization();

</script>

<template>
    <div>
        <h3>{{t('INPUT_DEVICE') }}</h3>
        <alt-dropdown v-model="settings.data.voiceInputDevice"
                      :elements="[
                          {
                              label: settings.devices.default ? t('DEFAULT_INPUT_DEVICE_NAMED', settings.devices.default) : t('DEFAULT_INPUT_DEVICE'),
                              value: 'default'
                          },
                          ...Object.entries(settings.devices)
                            .filter(e => e[0] != 'default')
                            .map(e => ({ value: e[0], label: e[1] }))
                      ]"
                      @change="settings.save('voiceInputDevice')"
                    :unknown-element="t('UNKNOWN_INPUT_DEVICE')"></alt-dropdown>
    </div>

    <volume-display :value="settings.currentVolume" :label="t('MIC_TEST')"></volume-display>
    <alt-button @click="settings.toggleMicTest()">{{ t(settings.micTest ? 'STOP_MIC_TEST' : 'START_MIC_TEST') }}</alt-button>
    <alt-slider v-model="settings.data.voiceInputVolume"
                @change="settings.save('voiceInputVolume')"
                :label="t('INPUT_VOLUME')"></alt-slider>
    <alt-slider v-model="settings.data.voiceVolume" @change="settings.save('voiceVolume')"
                :label="t('OUTPUT_VOLUME')" :max="200"></alt-slider>
    <alt-checkbox v-model="settings.data.voiceNormalization" @change="settings.save('voiceNormalization')"
                  :label="t('VOICE_NORMALIZATION')"></alt-checkbox>
    <alt-checkbox v-model="settings.data.voiceNoiseSuppression" @change="settings.save('voiceNoiseSuppression')"
                  :label="t('NOISE_SUPPRESSION')"></alt-checkbox>

    <alt-checkbox v-model="settings.data.voiceActivation" @change="settings.save('voiceActivation')"
                  :label="t('VOICE_ACTIVATION')"></alt-checkbox>
    <div v-if="!settings.data.voiceActivation">
        <h3>{{ t('PUSH_TO_TALK_KEY') }}</h3>
        <alt-key-input v-model="settings.data.voiceActivationKey"
                       @change="settings.save('voiceActivationKey')"></alt-key-input>
    </div>
    <alt-slider v-if="settings.data.voiceActivation" v-model="settings.data.voiceInputSensitivity"
                @change="settings.save('voiceInputSensitivity')" :label="t('INPUT_SENSITIVITY')"></alt-slider>
</template>

<style lang="scss" scoped>
@import '@/assets/base.scss';

h3 {
    margin-bottom: u(16);
}

.reload {
    display: flex;
    gap: u(16);

    svg {
        width: u(24);
        height: u(24);
        fill: $text_light;
    }
}

</style>