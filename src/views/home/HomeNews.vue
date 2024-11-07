<script lang="ts">
/**
 * @see https://r.3v.fi/discord-timestamps/
 */
const DiscordTimestampType = Object.freeze({
	/** @example 3:48 PM */
	ShortTime: "t",
	/** @example 3:48:00 PM */
	LongTime: "T",
	/** @example 9/28/24 */
	ShortDate: "d",
	/** @example September 28, 2024 */
	LongDate: "D",
	/** @example September 28, 2024 at 3:48 PM */
	ShortDateTime: "f",
	/** @example Saturday, September 28, 2024 at 3:48 PM */
	LongDateTime: "F",
	/** @example 25 minutes ago */
	RelativeTime: "R",
});
type DiscordTimestampType =
	(typeof DiscordTimestampType)[keyof typeof DiscordTimestampType];

const DiscordTimestampTypes = Object.values(DiscordTimestampType);
export const isDiscordTimestampType = (
	type: string,
): type is DiscordTimestampType => {
	return DiscordTimestampTypes.includes(type as DiscordTimestampType);
};

const discordTimestampFormatMap: Readonly<
	Record<DiscordTimestampType, (moment: moment.Moment) => string>
> = Object.freeze({
	[DiscordTimestampType.ShortTime]: (moment: moment.Moment) =>
		moment.format("h:mm A"),
	[DiscordTimestampType.LongTime]: (moment: moment.Moment) =>
		moment.format("h:mm:ss A"),
	[DiscordTimestampType.ShortDate]: (moment: moment.Moment) =>
		moment.format("MM/DD/YY"),
	[DiscordTimestampType.LongDate]: (moment: moment.Moment) =>
		moment.format("MMMM DD, YYYY"),
	[DiscordTimestampType.ShortDateTime]: (moment: moment.Moment) =>
		moment.format("MM/DD/YY h:mm A"),
	[DiscordTimestampType.LongDateTime]: (moment: moment.Moment) =>
		moment.format("dddd, MMMM DD, YYYY h:mm A"),
	[DiscordTimestampType.RelativeTime]: (moment: moment.Moment) =>
		moment.fromNow(),
});
</script>

<script setup lang="ts">
import BlockContainer from "@/components/container/BlockContainer.vue";
import sanitizeHtml from "sanitize-html";
import { useVersionStore } from "@/stores/version";
import { useLocalization } from "@/stores/localization";
import { computed, onMounted, onUpdated, ref } from "vue";
import moment from "moment/min/moment-with-locales";

const version = useVersionStore();
const locale = useLocalization();
const items = computed(() => version.rss?.items.slice(0, 10) ?? []);

const mainRef = ref<HTMLDivElement>();

function sanitize(content: string) {
	return sanitizeHtml(content, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "del"]),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			img: [
				...(sanitizeHtml.defaults.allowedAttributes.img || []),
				"data-emoji",
			],
			span: [
				"data-timestamp",
				"data-mention",
				"data-localized",
				"data-spoiler",
				"data-images",
			],
		},
	});
}

function formatDate(pubDate: string) {
	return moment(pubDate)
		.locale(locale.currentLocale.intlCode || "en")
		.format("MM/DD/YYYY hh:mm A");
}

const hook = () => {
	const value = mainRef.value;
	if (!value) return;

	for (let el of Array.from(value.querySelectorAll("a"))) {
		el.setAttribute("tabindex", "-1");
	}

	for (let el of Array.from(value.querySelectorAll("span[data-mention]"))) {
		const color = el.getAttribute("data-mention");
		el.removeAttribute("data-mention");
		el.setAttribute("style", "--color: " + (color || "201, 205, 251"));
		el.classList.add("mention");
	}

	for (let el of Array.from(value.querySelectorAll("span[data-timestamp]"))) {
		const value = el.getAttribute("data-timestamp");
		el.removeAttribute("data-timestamp");
		const type =
			value && isDiscordTimestampType(value)
				? value
				: DiscordTimestampType.ShortDateTime;

		if (el.textContent === null) return;
		const timestamp = parseInt(el.textContent);
		if (isNaN(timestamp)) return;

		el.textContent = discordTimestampFormatMap[type](
			moment.unix(timestamp).locale(locale.currentLocale.intlCode || "en"),
		);
		el.classList.add("timestamp");
	}

	for (let el of Array.from(value.querySelectorAll("span[data-localized]"))) {
		const arg = el.getAttribute("data-localized");
		el.innerHTML = locale.t((el as HTMLDivElement).innerText ?? "", arg ?? "");
		el.removeAttribute("data-localized");
	}

	for (let el of Array.from(value.querySelectorAll("span[data-spoiler]"))) {
		el.innerHTML = "<span>" + el.innerHTML + "</span>";
		el.removeAttribute("data-spoiler");
		el.setAttribute("data-clickable", "");
		el.classList.add("spoiler");
		el.addEventListener("click", (e) => {
			e.stopPropagation();
			el.classList.add("opened");
		});
	}

	for (let el of Array.from(value.querySelectorAll("span[data-images]"))) {
		el.addEventListener("wheel", (e) => {
			if (el.scrollWidth <= el.clientWidth) return;
			const event = e as WheelEvent;
			if (event.deltaY == 0 || event.shiftKey) return;
			const mod = event.deltaY > 0 ? 1 : -1;
			const rect = el.getBoundingClientRect();
			let index = Array.from(el.children).findIndex(
				(e) => e.getBoundingClientRect().left + 6 >= rect.left,
			);
			index += mod;
			if (index < 0) index = 0;
			if (index >= el.children.length) index = el.children.length - 1;
			if (
				(el.scrollLeft == 0 && mod == -1) ||
				(el.scrollLeft + el.clientWidth >= el.scrollWidth && mod == 1)
			)
				return;
			event.preventDefault();
			el.children[index]?.scrollIntoView({
				block: "nearest",
				inline: "start",
				behavior: "smooth",
			});
		});
	}

	for (let el of Array.from(value.querySelectorAll("a"))) {
		el.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			window.open(el.href);
		});
	}
};
onUpdated(hook);
onMounted(hook);

function openLink(link: string) {
	window.open(link);
}
</script>

<template>
	<div class="news" v-if="version.rss" dir="ltr" ref="mainRef">
		<block-container
			class="news__frame"
			:class="{ 'news__frame--no-link': !el.link }"
			v-for="el in items"
			@click="el.link && openLink(el.link)"
		>
			<div class="news__title">{{ el.title }}</div>
			<div class="news__content" v-html="sanitize(el.content)"></div>
			<div class="news__info">
				<div class="news__creator" v-html="sanitize(el.creator)"></div>
				<div>{{ formatDate(el.isoDate) }}</div>
			</div>
		</block-container>
	</div>
</template>

<style lang="scss" scoped>
.news {
	* {
		unicode-bidi: unset !important;
	}
	&__frame {
		display: flex;
		flex-direction: column;
		gap: u(24);
		overflow: hidden;
		transition:
			opacity 0.2s ease-in-out,
			outline-color 0.2s ease-in-out,
			transform 0.2s ease;
		cursor: pointer;
		padding: u(24);

		+ * {
			margin-top: u(16);
		}

		&--no-link {
			cursor: default;
			border: solid u(1) transparent !important;
			transform: none !important;

			> * {
				pointer-events: all;
			}
		}
	}

	&__title {
		font-weight: 500;
		font-size: u(18);
		margin-bottom: u(-8);

		&:empty {
			display: none;
		}
	}

	&__content,
	&__creator {
		text-align: left;
		overflow: hidden;
		word-break: break-word;

		:deep(img[data-emoji]) {
			min-width: 1.375em;
			height: 1.375em;
			font-weight: 500;
			overflow: visible;
			white-space: nowrap;
			display: inline-block;
			vertical-align: bottom;
		}
	}

	&__content {
		font-size: u(16);
		line-height: 1.4;
		white-space: pre-wrap;
		color: #f1f2f2;
		font-weight: 500;
		overflow: hidden;

		:deep(span[data-timestamp]),
		:deep(span[data-mention]),
		:deep(span[data-spoiler]) {
			display: none;
		}

		:deep(span[data-images]) {
			width: 100%;
			overflow: hidden;
			overflow-x: scroll;
			height: u(300);
			display: flex;
			gap: u(16);
			margin-top: u(32);
			padding-bottom: u(8);
			box-sizing: content-box;
			@include scrollbar();

			img {
				height: u(300);
				width: auto;
			}

			&:empty {
				display: none;
			}
		}

		:deep(span.timestamp) {
			background: rgba(white, 0.1);
			border-radius: u(4);
			padding: u(2);
		}

		:deep(span.mention) {
			color: rgb(var(--color));
			background: rgba(var(--color), 0.1);
			border-radius: u(4);
			font-weight: 600;
			padding: u(2);

			&:hover {
				background: rgba(var(--color), 0.3);
			}
		}

		:deep(span.spoiler) {
			background: #0c0c0c;
			border-radius: u(4);
			padding: u(2);
			transition: background-color 0.1s ease;

			> span {
				opacity: 0;
				transition: opacity 0.1s ease;
			}

			&.opened {
				pointer-events: none;
				background: rgba(white, 0.1);

				> span {
					opacity: 1;
				}
			}
		}

		:deep(strong),
		:deep(b) {
			font-weight: 700 !important;
		}

		:deep(blockquote) {
			padding: u(4) u(12);
			margin: u(4) 0;
			border-left: solid u(4) rgba(white, 0.3);
			border-radius: u(2);
		}

		:deep(code) {
			margin: 0;
			background: rgba(black, 0.3);
			padding: u(2);
			border-radius: u(4);
			color: white;
			font-weight: 300;
			font-family: "JetBrains Mono", monospace;
			line-height: u(20);

			.mention {
				color: inherit;
				background: unset;
				border-radius: unset;
				font-weight: 500;
				padding: unset;
			}
		}

		:deep(pre) {
			margin: 0;
			padding: 0;

			> code {
				padding: u(12) u(8);
				width: 100%;
				display: block;
				border: solid u(1) rgba(white, 0.1);
			}
		}

		:deep(a) {
			color: $text_link;
			font-weight: 500;
		}

		:deep(table) {
			border-collapse: collapse;
			td,
			tr,
			th {
				border: solid u(1) rgba(white, 0.2);
				padding: u(8);
			}

			th {
				font-weight: 600;
			}
		}
	}

	&__creator {
		&:empty {
			display: none;
		}
	}

	&__info {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: u(8);
		color: rgba($text_light, 0.5);
		font-size: u(14);
	}
}
</style>
