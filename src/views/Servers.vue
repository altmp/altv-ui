<script setup lang="ts">
import Refresh from "../components/icons/Refresh.vue";
import ServersFilter from "@/views/servers/ServersFilter.vue";
import ServersTable from "@/views/servers/ServersTable.vue";
import Loader from "@/components/Loader.vue";
import ServersStat from "@/views/servers/ServersStat.vue";
import { useLocalization } from "@/stores/localization";
import { useServersStore } from "@/stores/servers";
import { playHoverSound, playClickSound } from "@/utils/playSound";
import ChevronUp from "@/components/icons/ChevronUp.vue";

const { t } = useLocalization();
const servers = useServersStore();

function reloadServers() {
	servers.reload();
}

// cannot use :active, cuz it triggers to every mouse button in CEF
function mouseDown(e: MouseEvent) {
	if (e.button != 0) return e.preventDefault();
	const target = e.currentTarget as HTMLDivElement;
	target.classList.add("active");
	function mouseUp() {
		target.classList.remove("active");
		document.removeEventListener("mouseup", mouseUp);
	}
	document.addEventListener("mouseup", mouseUp);
}

const filters = t("FILTERS");
</script>

<template>
	<div class="view">
		<div class="left">
			<div class="menu-collapsed">
				<chevron-up style="rotate: 90deg" />
				<div
					style="letter-spacing: 0.05em"
					:data-kanji="
						!!filters.match(
							/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/,
						)
					"
				>
					{{ filters }}
				</div>
			</div>
			<div class="menu">
				<div class="menu__header">
					<h1>{{ t("SERVERS") }}</h1>
					<refresh
						class="view__refresh"
						@click="
							reloadServers();
							playClickSound();
						"
						@mousedown="mouseDown"
						@mouseenter="playHoverSound"
					/>
				</div>
				<div class="menu__content">
					<servers-filter />
				</div>
				<div class="menu__footer">
					<servers-stat />
				</div>
			</div>
		</div>

		<div class="table">
			<div class="table__wrapper">
				<div class="table__center" v-if="servers.isLoading">
					<loader />
				</div>
				<div class="table__center" v-else-if="servers.isError">
					<svg
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 2c5.523 0 10 4.478 10 10s-4.477 10-10 10S2 17.522 2 12 6.477 2 12 2Zm0 1.667c-4.595 0-8.333 3.738-8.333 8.333 0 4.595 3.738 8.333 8.333 8.333 4.595 0 8.333-3.738 8.333-8.333 0-4.595-3.738-8.333-8.333-8.333Zm-.001 10.835a.999.999 0 1 1 0 1.998.999.999 0 0 1 0-1.998ZM11.994 7a.75.75 0 0 1 .744.648l.007.101.004 4.502a.75.75 0 0 1-1.493.103l-.007-.102-.004-4.501a.75.75 0 0 1 .75-.751Z"
							fill="#ffffff"
						/>
					</svg>
					<div class="msg">
						{{ t("MASTERLIST_RESPONSE_ERROR") }}
					</div>
				</div>
				<servers-table v-else />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.view {
	display: flex;
	max-height: 100vh;
	overflow: hidden;
	word-break: break-word;

	&__refresh {
		width: u(48);
		height: u(48);
		cursor: pointer;
		flex-shrink: 0;
		fill: rgba(#f1f2f2, 0.32);
		transition:
			fill 0.1s ease,
			rotate 0.5s ease;
		rotate: 360deg;

		&:hover {
			fill: rgba(#f1f2f2, 0.5);
		}

		&.active {
			rotate: 0deg;
			fill: rgba(#f1f2f2, 0.8);
			transition: fill 0.1s ease;
		}
	}

	.menu-collapsed {
		display: none;
		border-right: #f1f2f21a u(1) solid;
		padding: u(10);
		width: u(44);

		[dir="rtl"] & {
			border-right: none;
			border-left: #f1f2f21a u(1) solid;

			svg {
				rotate: 180deg;
			}
		}

		@media (max-width: 135vh) {
			display: flex;
			gap: u(12);
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}

		div {
			transform: rotate(180deg);
			writing-mode: vertical-rl;

			&[data-kanji="true"] {
				transform: none;
			}
		}
	}

	.menu {
		width: u(416);
		border-right: #f1f2f21a u(1) solid;
		display: flex;
		flex-direction: column;
		height: 100vh;

		[dir="rtl"] & {
			border-right: none;
			border-left: #f1f2f21a u(1) solid;
		}

		&__header,
		&__content {
			border-bottom: #f1f2f21a u(1) solid;
		}

		&__content {
			flex: 1;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		> * {
			padding: u(48);
		}

		@media (max-width: 135vh) {
			display: none;
			position: absolute;
			left: 0;
			background: $back_black;
			z-index: 10;

			[dir="rtl"] & {
				left: unset;
				right: 0;
			}
		}
	}

	.left {
		display: flex;
		max-height: 100vh;
		position: relative;

		&:hover {
			.menu {
				display: flex;
			}
		}
	}

	.table {
		flex: 1;

		&__wrapper {
			height: 100%;
			//noinspection CssInvalidPropertyValue
			overflow-y: overlay;
			padding: 0;

			table {
				margin-top: u(24);
				//margin-bottom: u(24);
			}

			@include scrollbar(22);
		}

		&__center {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: u(18);
			gap: u(12);
			flex-direction: column;
			text-align: center;

			svg {
				width: u(32);
				height: u(32);
			}
		}
	}
}
</style>
