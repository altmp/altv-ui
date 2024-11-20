<script setup lang="ts">
import { injectContext } from "@/utils/injectContext";
import { ConsoleTimeFormatContextInjectionKey } from "./time-format";

const props = defineProps<{ time: Date }>();

const { useFormattedTime } = injectContext(
	ConsoleTimeFormatContextInjectionKey,
);
const formattedTime = useFormattedTime(props.time);
</script>

<template>
	<span class="whitespace-nowrap text-xs leading-5 text-white/60">
		{{ formattedTime }}
	</span>
</template>
