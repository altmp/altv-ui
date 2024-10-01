<script setup lang="ts">
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import {
	type ConsoleEntry,
	ConsoleTimeFormatContextInjectionKey,
	LogType,
} from "@/stores/console";
import { DynamicScrollerItem } from "vue-virtual-scroller";
import { copyText } from "@/utils/copy";
import Copy from "@/components/icons/Copy.vue";
import { computed } from "vue";
import { injectContext } from "@/utils/injectContext";

const props = defineProps<{
	item: ConsoleEntry;
	index: number;
	active: boolean;
}>();

const { formatTime, timeFormat } = injectContext(
	ConsoleTimeFormatContextInjectionKey,
);
const formattedTime = computed(() =>
	formatTime(props.item.time, timeFormat.value),
);
</script>

<template>
	<DynamicScrollerItem
		:item="props.item"
		:index="props.index"
		:active="props.active"
		:data-index="props.index"
		:data-active="props.active"
		class="message"
		:size-dependencies="[props.item.count]"
		:class="{
			error: props.item.type === LogType.Error,
			warn: props.item.type === LogType.Warning,
			debug: props.item.type === LogType.Debug,
		}"
	>
		<svg
			v-if="props.item.type === LogType.Error"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm3.446 4.897.084.073a.75.75 0 0 1 .073.976l-.073.084L13.061 12l2.47 2.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-2.47 2.47a.75.75 0 0 1-.976.072l-.084-.073a.75.75 0 0 1-.073-.976l.073-.084L10.939 12l-2.47-2.47a.75.75 0 0 1-.072-.976l.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l2.47-2.47a.75.75 0 0 1 .976-.072Z"
			/>
		</svg>
		<svg
			v-if="props.item.type === LogType.Warning"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M10.91 2.782a2.25 2.25 0 0 1 2.975.74l.083.138 7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.243a2.25 2.25 0 0 1-2.041-3.197l.072-.143L10.031 3.66a2.25 2.25 0 0 1 .878-.878Zm9.505 15.613-7.76-14.008a.75.75 0 0 0-1.254-.088l-.057.088-7.757 14.008a.75.75 0 0 0 .561 1.108l.095.006h15.516a.75.75 0 0 0 .696-1.028l-.04-.086-7.76-14.008 7.76 14.008ZM12 16.002a.999.999 0 1 1 0 1.997.999.999 0 0 1 0-1.997ZM11.995 8.5a.75.75 0 0 1 .744.647l.007.102.004 4.502a.75.75 0 0 1-1.494.103l-.006-.102-.004-4.502a.75.75 0 0 1 .75-.75Z"
			/>
		</svg>
		<svg
			v-if="props.item.type === LogType.Debug"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M10.5 2.751a.75.75 0 0 0-1.5 0v.752c0 .633.196 1.22.53 1.703A3.753 3.753 0 0 0 7.01 8.49h-.257a2.25 2.25 0 0 1-2.24-2.26l.006-1.485a.75.75 0 1 0-1.5-.006l-.007 1.485A3.75 3.75 0 0 0 6.747 9.99H7v1.51H2.75a.75.75 0 0 0 0 1.5H7v1.992h-.253a3.75 3.75 0 0 0-3.735 3.765l.007 1.486a.75.75 0 0 0 1.5-.006l-.007-1.486a2.25 2.25 0 0 1 2.241-2.259H7.226a5.002 5.002 0 0 0 9.548 0H17.247a2.25 2.25 0 0 1 2.24 2.26l-.006 1.485a.75.75 0 0 0 1.5.006l.006-1.486a3.75 3.75 0 0 0-3.734-3.765H17V13h4.251a.75.75 0 0 0 0-1.5H17V9.99h.253a3.75 3.75 0 0 0 3.735-3.766L20.98 4.74a.75.75 0 0 0-1.5.006l.006 1.486a2.25 2.25 0 0 1-2.24 2.259h-.256a3.753 3.753 0 0 0-2.52-3.284c.333-.484.529-1.07.529-1.703v-.752a.75.75 0 0 0-1.5 0v.752a1.5 1.5 0 0 1-3 0v-.752Zm-2 6.002a2.25 2.25 0 0 1 2.25-2.25h2.5a2.25 2.25 0 0 1 2.25 2.25V15a3.5 3.5 0 1 1-7 0V8.753Z"
			/>
		</svg>
		<div class="text">
			<span class="right"
				><span class="copy" @click="copyText(item.message)"><copy /></span
				><span v-if="item.resource" class="resource">{{ item.resource }}</span>
				<span class="time">{{ formattedTime }}</span></span
			><span class="count" v-if="item.count > 1">{{ item.count }}</span>
			<span class="content"><span v-html="item.html" />&nbsp;</span>
		</div>
	</DynamicScrollerItem>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";
@import "@/assets/_palette.scss";

.message {
	padding: u(7) u(18) u(7) u(30);

	&.error {
		background: rgba(#eb2f06, 0.1);
		color: lighten(#e55039, 10);
		fill: lighten(#e55039, 10);
	}

	&.warn {
		background: rgba(#f6b93b, 0.1);
		color: #f6b93b;
		fill: #f6b93b;
	}

	&.info {
		background: rgba(#3498db, 0.1);
		color: lighten(#3498db, 10);
		fill: lighten(#3498db, 10);
	}

	&.debug {
		background: rgba(#9b59b6, 0.1);
		color: lighten(#9b59b6, 20);
		fill: lighten(#9b59b6, 20);
	}

	svg {
		height: u(16);
		width: u(16);
		position: absolute;
		margin-top: u(2);
		margin-left: u(-22);
		pointer-events: none;
	}

	.right {
		float: right;
		top: 0;
		padding-left: u(15);
		padding-bottom: u(10);
		color: #b2bec3;
		text-align: right;

		&,
		* {
			user-select: none;
		}

		.resource {
			white-space: nowrap;
			display: inline-block;
			background: #2d3436;
			color: white;
			padding: 0 u(5);
			border-radius: u(4);
			border: solid u(1) rgba(white, 0.2);
			line-height: 1.3;
		}

		.copy {
			vertical-align: -0.23em;
			margin-right: u(6);
			display: inline-block !important;
			width: u(16);
			height: u(16);
			cursor: pointer;
		}

		.copy {
			svg {
				fill: rgba(white, 0.7);
				margin: 0;
				position: unset;
			}

			&:hover svg {
				fill: rgba(white, 1);
			}

			&:active svg {
				fill: rgba(white, 0.85);
			}
		}

		overflow: hidden;
	}

	.count {
		background: #2d3436;
		border: solid u(1) rgba(white, 0.2);
		color: white;
		box-sizing: border-box;
		border-radius: u(4);
		min-width: u(16);
		height: u(16);
		padding-left: u(3);
		padding-right: u(3);
		font-size: u(13);
		margin-right: u(6);
	}

	.content {
		white-space: pre-wrap;

		:deep(a) {
			color: inherit !important;
		}
	}

	&,
	*,
	:deep(*) {
		user-select: text;
	}

	font-size: u(14);
	border-top: solid u(1) rgba(white, 0.15);
	box-sizing: border-box;
	line-height: u(20);
}
</style>
