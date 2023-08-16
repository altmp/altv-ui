<script setup lang="ts">
import {useLocalization} from "@/stores/localization";
import {computed} from "vue";

const locale = useLocalization();

const props = defineProps<{ localeKey: string }>();

const blocks = computed(() => {
    console.log(props)
    const raw = locale.tRaw(props.localeKey);
    const slots = (raw.match(/{(\d+)}/g) ?? []).map(e => e.substring(1, e.length - 1));
    const parts = raw.split(/{\d+}/g) ?? [];

    return { slots, parts };
});
</script>

<template>
    <template v-for="(part, i) in blocks.parts"> <slot v-if="blocks.slots[i - 1]" :name="blocks.slots[i - 1]"></slot>{{ part }}</template>
</template>