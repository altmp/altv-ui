<script setup lang="ts">

import {useModalStore} from "@/stores/modal";
import AltButton from "@/components/AltButton.vue";
import {useLocalization} from "@/stores/localization";
import AltInput from "@/components/form/AltInput.vue";
import {useSettingsStore} from "@/stores/settings";
import {nextTick, onMounted, onUpdated, ref, watch} from "vue";

const settings = useSettingsStore();
const modal = useModalStore();
const value = ref("");
const input = ref<{ focus(): void }>();
const { t } = useLocalization();


onMounted(() => {
    nextTick(() => {
        input.value?.focus()
    });
});

function save() {
    const nickname = value.value.trim();
    if (!nickname) return;
    settings.data.name = nickname;
    settings.save('name');
    modal.close();
}

</script>

<template>
    <div class="modal">
        <div class="modal__header">
            <div class="modal__title">{{ t('ENTER_YOUR_NICKNAME') }}</div>
        </div>
        <div class="modal__content">
            <alt-input ref="input" class="modal__input" v-model="value" @keydown.enter="save" />
        </div>
        <div class="modal__actions">
            <div class="modal__buttons">
                <alt-button color="primary" @click="save">{{ t('SAVE') }}</alt-button>
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
    gap: u(42);

    &__input {
        background: #141619;
    }

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

    &__buttons {
        display: flex;
        gap: u(24);
        font-size: u(18);
    }
}
</style>