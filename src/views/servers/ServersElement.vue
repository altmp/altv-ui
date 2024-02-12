<script setup lang="ts">
import { computed } from "vue";
import LanguageFlag from "../../components/LanguageFlag.vue";
import PlayerCount from "../../components/PlayerCount.vue";
import Tooltip from "@/components/container/Tooltip.vue";
import Star from "@/components/icons/Star.vue";
import type { IServer } from "@/types/IServer";
import ServerIcons from "@/components/ServerIcons.vue";
import { ModalType, useModalStore } from "@/stores/modal";
import { useServersStore, type ServerGroup, isGroup } from "@/stores/servers";
import { useLocalization } from "@/stores/localization";
import ChevronUp from "@/components/icons/ChevronUp.vue";
import Verified from "@/components/icons/Verified.vue";
import Promoted from "@/components/icons/Promoted.vue";
import { useExpandedStateStore } from "@/stores/expandedState";

const modal = useModalStore();
const servers = useServersStore();
const expandedState = useExpandedStateStore();
const { t } = useLocalization();

const props = defineProps<{
	item: IServer | ServerGroup;
}>();

const favorite = computed(() => {
	if (isGroup(props.item)) return false;
	const server = props.item;
	return servers.favorite.findIndex((s) => s.id === server.publicId) !== -1;
});
</script>

<template>
	<tr
		v-if="isGroup(item)"
		class="server group"
		:data-expanded="expandedState.expandedState.get(item.id) ? '' : undefined"
		@click="expandedState.toggleRow(item.id)"
	>
		<td>
			<div class="name__row">
				<div style="display: flex; gap: 0 0.4rem; align-items: center">
					<ChevronUp
						class="group__chevron"
						style="
							width: 2.2vmin;
							height: 2.2vmin;
							stroke-width: 1.5;
							color: rgba(255, 255, 255, 0.6);
						"
					/>
					<span>{{ item.name }}</span>
				</div>

				<div class="group-icons">
					<tooltip :text="t('SERVER_VERIFIED')" v-if="item.verified">
						<verified style="width: 1.9vmin; height: 1.9vmin" />
					</tooltip>
					<tooltip :text="t('SERVER_PROMOTED')" v-if="item.promoted">
						<promoted style="width: 1.9vmin; height: 1.9vmin" />
					</tooltip>
				</div>
			</div>
		</td>
		<td>
			<player-count
				:online="true"
				dir="ltr"
				:players="item.playersCount"
				:max-players="item.maxPlayersCount"
			></player-count>
		</td>
		<td></td>
		<td></td>
	</tr>
	<tr
		v-else
		class="server"
		:data-group-item="item.group !== null ? '' : undefined"
		@click="modal.open(ModalType.Connect, { server: item })"
	>
		<td class="name">
			<div class="name__row">
				<div class="name__content">
					<Tooltip
						class="name__favorite"
						:text="t('SERVER_FAVORITE')"
						v-if="favorite"
					>
						<star />
					</Tooltip>
					<span>{{ item.name }}</span>
				</div>
				<server-icons :server="item" />
			</div>
			<div class="tags">
				<span v-for="tag in item.tags.filter(Boolean)" class="tags__element">{{
					tag
				}}</span>
			</div>
		</td>
		<td class="players">
			<player-count
				:online="true"
				dir="ltr"
				:players="item.playersCount"
				:max-players="item.maxPlayersCount"
			></player-count>
		</td>
		<!--        <td class="ping">-->
		<!--            <div class="ping__value" v-if="item.ping === 65535">...</div>-->
		<!--            <div class="ping__value" v-else-if="item.ping == null || item.ping === 0">N/A</div>-->
		<!--            <template v-else>-->
		<!--                <span class="ping__value">{{ item.ping }}</span>-->
		<!--                <span class="ping__indicator" :class="{ good: item.ping < 30, bad: item.ping > 100 }"></span>-->
		<!--            </template>-->
		<!--        </td>-->
		<td class="gameMode">
			<span>{{ item.gameMode }}</span>
		</td>
		<td class="language">
			<language-flag :language="item.language"></language-flag>
		</td>
	</tr>
</template>

<style lang="scss" scoped>
.group-icons {
	display: flex;
	gap: u(16);
	flex-shrink: 0;

	&:empty {
		display: none !important;
	}
}

.group {
	background-color: rgb(255, 255, 255, 0.06);

	& > td:first-child {
		padding-left: 3vmin;
	}

	&:hover {
		background-color: rgb(255, 255, 255, 0.1);
	}
	.group__chevron {
		transition: rotate 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		rotate: 90deg;
	}

	&[data-expanded] {
		.group__chevron {
			rotate: 180deg;
		}
	}
}

.server {
	&[data-group-item] {
		.name::before {
			content: "";
			display: block;
			height: 100%;
			width: 6px;
			position: absolute;
			inset: 0;
			background-color: rgb(255, 255, 255, 0.06);
		}
	}

	.name {
		position: relative;

		&__row {
			display: flex;
			justify-content: space-between;
			gap: u(12);
			padding-right: u(24);

			[dir="rtl"] & {
				padding-right: unset;
				padding-left: u(24);
				direction: rtl;
			}

			svg {
				height: u(12);
			}
		}

		&__favorite {
			margin-right: u(8);
			[dir="rtl"] & {
				margin-right: unset;
				margin-left: u(8);
			}
			display: inline-block;
		}

		.tags {
			margin-top: u(12);
			display: flex;
			gap: u(4);
			overflow-x: hidden;
			flex-wrap: wrap;

			&:empty {
				display: none;
			}

			&__element {
				padding: u(6);
				font-size: u(12);
				line-height: u(12);
				color: #ffffff;
				background: rgba(255, 255, 255, 0.1);
				border-radius: u(4);
				font-weight: 500; // 600 in figma, figma is bad with scaling font weight for some reason
				white-space: nowrap;
			}
		}
	}

	.ping {
		&__value {
			display: inline-block;
			vertical-align: middle;
			font-weight: 500;
		}

		&__indicator {
			display: inline-block;
			width: u(8);
			height: u(8);
			border-radius: 50%;
			vertical-align: middle;
			margin-left: u(12);
			transition: background-color 0.2s ease-in-out;

			background: #ffb900;

			&.good {
				background: #00ad56;
			}

			&.bad {
				background: #e20338;
			}

			&.notAvailable {
				background: transparent;
			}
		}
	}
}
</style>
