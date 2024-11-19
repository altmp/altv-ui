<script setup lang="ts">
import { PixelScaleContextInjectionKey } from "@/utils/pixelScale";
import { injectContext } from "@/utils/injectContext";
import { TooltipArrow } from "radix-vue";

const { pixelScale } = injectContext(PixelScaleContextInjectionKey);
</script>

<template>
	<TooltipArrow
		style="color: #3c3c3c; margin-top: -0.0625rem; z-index: 49"
		:width="12 * pixelScale"
		:height="5 * pixelScale"
	>
		<path d="M16.1 9.6a2 2 0 0 1-2.2 0L0 0h30z" fill="currentColor" />
	</TooltipArrow>
</template>
