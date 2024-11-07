<script setup lang="ts">
import BlockContainer from "@/components/container/BlockContainer.vue";
import devsJson from "@/assets/json/devs.json";
import libsJson from "@/assets/json/libs.json";
import emojis from "@/assets/json/emojis.json";
import { useVersionStore } from "@/stores/version";
import { useLocalization } from "@/stores/localization";
import sanitizeHtml from "sanitize-html";
import { ref } from "vue";
import {
	playEmojiSound,
	playHoverSound,
	playMoveSound,
} from "@/utils/playSound";
import type { IDeveloper } from "@/types/IDeveloper";
import Developer from "@/views/about/Developer.vue";

interface ILibrary {
	name: string;
	description: string;
	source: string;
	licence: string;
	licenceLink: string;
}

const libs = libsJson as ILibrary[];
const devs = devsJson as IDeveloper[];

const emoji = ref(
	emojis[Math.floor(Math.random() * Math.floor(emojis.length))],
);

function updateEmoji() {
	emoji.value = emojis[Math.floor(Math.random() * Math.floor(emojis.length))];
	playEmojiSound();
}

function open(url: string) {
	window.open(url);
}

const version = useVersionStore();
const { t } = useLocalization();

function sanitize(data: string) {
	return sanitizeHtml(data, { allowedTags: [] });
}

const considerSupporting = sanitize(t("CONSIDER_SUPPORTING")).replace(
	"{0}",
	'<a href="https://patreon.com/altvmp" tabindex="-1" target="_blank">' +
		sanitize(t("CONSIDER_SUPPORTING_LINK")) +
		"</a>",
);
</script>

<template>
	<div class="view">
		<div class="view__version">
			<h1>
				{{ version.orange ? "GTA:Orange" : "alt:V Multiplayer" }}
				{{ version.version }}
			</h1>
			<div class="icons">
				<a
					href="https://discord.gg/altv"
					target="_blank"
					tabindex="-1"
					@click="playMoveSound"
					@mouseenter="playHoverSound"
				>
					<svg
						width="43"
						height="32"
						viewBox="0 0 43 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M35.7658 2.67995C32.9918 1.40994 30.0633 0.508951 27.0552 0C26.6435 0.735868 26.2711 1.49298 25.9394 2.26816C22.7351 1.78531 19.4766 1.78531 16.2723 2.26816C15.9404 1.49306 15.5679 0.735957 15.1565 0C12.1464 0.513249 9.21596 1.41638 6.43916 2.68659C0.926494 10.8427 -0.567902 18.7962 0.179296 26.6368C3.40765 29.022 7.0211 30.8361 10.8626 32C11.7276 30.8366 12.493 29.6024 13.1507 28.3105C11.9015 27.8439 10.6957 27.2683 9.5475 26.5903C9.8497 26.3711 10.1453 26.1453 10.4309 25.9261C13.772 27.4974 17.4187 28.312 21.1108 28.312C24.803 28.312 28.4496 27.4974 31.7908 25.9261C32.0797 26.1619 32.3752 26.3877 32.6741 26.5903C31.5236 27.2694 30.3157 27.8461 29.0643 28.3138C29.7212 29.6052 30.4867 30.8383 31.3524 32C35.1971 30.8407 38.8134 29.0276 42.0423 26.6401C42.919 17.5475 40.5446 9.66708 35.7658 2.67995ZM14.0971 21.8149C12.0149 21.8149 10.2947 19.9253 10.2947 17.6007C10.2947 15.276 11.9551 13.3699 14.0905 13.3699C16.2258 13.3699 17.9327 15.276 17.8962 17.6007C17.8597 19.9253 16.2191 21.8149 14.0971 21.8149ZM28.1245 21.8149C26.039 21.8149 24.3254 19.9253 24.3254 17.6007C24.3254 15.276 25.9859 13.3699 28.1245 13.3699C30.2631 13.3699 31.9568 15.276 31.9203 17.6007C31.8837 19.9253 30.2465 21.8149 28.1245 21.8149Z"
							fill="white"
						/>
					</svg>
				</a>
				<a
					href="https://twitter.com/altvmp"
					target="_blank"
					tabindex="-1"
					@click="playMoveSound"
					@mouseenter="playHoverSound"
				>
					<svg
						width="39"
						height="32"
						viewBox="0 0 39 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M34.8157 8.0455C34.8392 8.38589 34.8392 8.72629 34.8392 9.06981C34.8392 19.5373 26.8706 31.6094 12.2996 31.6094V31.6031C7.99529 31.6094 3.78039 30.3765 0.15686 28.0518C0.782743 28.1271 1.41176 28.1647 2.04235 28.1663C5.60941 28.1694 9.07451 26.9726 11.8808 24.7686C8.49098 24.7043 5.51843 22.4941 4.48 19.2675C5.66745 19.4965 6.89098 19.4494 8.05647 19.131C4.36078 18.3843 1.70196 15.1373 1.70196 11.3663C1.70196 11.3318 1.70196 11.2988 1.70196 11.2659C2.80314 11.8792 4.03608 12.2196 5.29725 12.2573C1.81647 9.93099 0.743527 5.3004 2.84549 1.68001C6.86745 6.62903 12.8016 9.63766 19.1718 9.95609C18.5333 7.20472 19.4055 4.32158 21.4635 2.38746C24.6541 -0.611753 29.6722 -0.458028 32.6714 2.73099C34.4455 2.38119 36.1459 1.73021 37.702 0.807855C37.1106 2.64158 35.8729 4.19923 34.2196 5.18903C35.7898 5.00393 37.3239 4.58354 38.7686 3.94197C37.7051 5.5357 36.3655 6.92393 34.8157 8.0455Z"
							fill="white"
						/>
					</svg>
				</a>
				<a
					href="https://patreon.com/altvmp"
					target="_blank"
					tabindex="-1"
					@click="playMoveSound"
					@mouseenter="playHoverSound"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M5 0C2.23858 0 0 2.23858 0 5V27C0 29.7614 2.23858 32 5 32H27C29.7614 32 32 29.7614 32 27V5C32 2.23858 29.7614 0 27 0H5ZM10.3125 6.87501V25.625H6.8125V6.87501H10.3125ZM26.4375 13.9375C26.4375 17.838 23.2755 21 19.375 21C15.4745 21 12.3125 17.838 12.3125 13.9375C12.3125 10.037 15.4745 6.87501 19.375 6.87501C23.2755 6.87501 26.4375 10.037 26.4375 13.9375Z"
							fill="white"
						/>
					</svg>
				</a>
			</div>
		</div>

		<div class="view__page">
			<div class="view__wrapper">
				<div class="view__columns">
					<div class="view__list view__libraries">
						<!--                        <div class="view__list-wrapper">-->
						<h2>{{ t("OPENSOURCE_LIBS") }}</h2>
						<p class="view__notice">{{ t("OPENSOURCE_LIBS_FULL") }}</p>
						<block-container
							class="view__library library"
							v-for="lib in libs"
							@click="open(lib.source)"
						>
							<div class="library__title">
								{{ lib.name }}
								<a
									:href="lib.licenceLink"
									target="_blank"
									tabindex="-1"
									@click.stop="playMoveSound"
									@mouseenter="playHoverSound"
									>{{ lib.licence }}</a
								>
							</div>
							<div class="library__description">{{ lib.description }}</div>
						</block-container>
						<!--                        </div>-->
						<br />
						<p class="view__notice view__notice--lower">
							Grand Theft Auto and Grand Theft Auto: V are registered trademarks
							of Take-Two Interactive Software. Any trademarks used belong to
							their respective owners. alt:V Multiplayer and altMP Project are
							not affiliated with or endorsed by Take-Two Interactive Software.
							alt:V Multiplayer and altMP Project do not host any user-made
							servers and is not responsible for user-made content. All
							user-made content are the property of their respective owners.<br /><br />
							&copy; 2023 AMC Alternative Multiplayer Solutions LTD
						</p>
						<p class="view__notice view__emoji" @click="updateEmoji">
							{{ emoji }}
						</p>
					</div>

					<div class="view__list view__developers">
						<!--                        <div class="view__list-wrapper">-->
						<h2>{{ t("DEVELOPERS_AND_CONTRIBUTORS") }}</h2>
						<p class="view__notice" v-html="considerSupporting" />
						<developer :dev="dev" v-for="dev in devs" />
						<!--                        </div>-->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.view {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: u(154) calc(100vh - #{u(154)});

	@include grid-borders(1, #f1f2f21a u(1) solid);

	> * {
		padding: u(48);
	}

	&__version {
		grid-column: 1 / 3;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.icons {
			display: flex;
			align-items: center;
			gap: u(32);
		}

		svg {
			width: auto;
			height: u(32);
		}
	}

	&__page {
		@include scrollable-block(48);
	}

	&__columns {
		display: grid;
		grid-template-columns: 9fr 10fr;
		grid-gap: u(48);
	}

	&__list {
		display: flex;
		flex-direction: column;
		gap: u(12);

		h2 {
			margin: 0 0 8px;
		}
	}

	&__notice {
		font-size: u(18);
		color: rgba($text_light, 0.5);
		font-weight: 500;
		margin: 0 0 u(16);

		:deep(a) {
			text-decoration: underline;
			font-weight: 500;
			font-size: u(18);
			color: rgba($text_light, 0.8);

			&:hover {
				color: rgba($text_light, 1);
			}

			&:active {
				color: rgba($text_light, 0.9);
			}
		}
	}

	&__emoji {
		height: u(30);
		display: flex;
		align-items: flex-end;
		cursor: pointer;
		width: max-content;
	}
}

.library {
	font-size: u(16);
	line-height: 1.3;
	white-space: pre-wrap;
	color: #f1f2f2;
	font-weight: 500;
	cursor: pointer;

	&__title {
		font-weight: 500;
		font-size: u(18);
		margin-bottom: u(6);

		a {
			color: white;
		}
	}
}

.developer {
	font-size: u(16);
	white-space: pre-wrap;
	color: #f1f2f2;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: u(12);
	pointer-events: none;

	&__image {
		height: u(32);
		width: u(32);
		border-radius: 50%;
	}

	&__username {
		font-weight: 600;
		margin-left: u(4);
	}
}
</style>
