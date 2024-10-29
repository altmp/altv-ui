<script setup lang="ts">
import { useLocalization } from "@/stores/localization";

const locale = useLocalization();

const props = defineProps({
	language: {
		type: String,
		required: true,
	},
});
</script>

<template>
	<div class="lang">
		{{
			language === "all"
				? locale.t("MULTILINGUAL")
				: (locale.locales.get(language)?.name ?? "Unknown")
		}}
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

.lang {
	display: flex;
	align-items: center;
	gap: u(12);

	[dir="rtl"] & {
		justify-content: center;
	}

	//.flag {
	//    background: black;
	//    border-radius: u(4);
	//    overflow: hidden;
	//    height: 1em;
	//    -webkit-backface-visibility: hidden;
	//    -webkit-transform: translate3d(0,0,0);
	//    transform: translateZ(0);
	//    outline:none;
	//    border:none;
	//    text-decoration:none;
	//}

	img {
		height: 1em;
	}
}
</style>
