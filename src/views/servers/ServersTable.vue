<script lang="ts" setup>
import { computed, ref } from "vue";
import SortAsc from "@/components/icons/SortAsc.vue";
import SortDesc from "@/components/icons/SortDesc.vue";
import ServersElement from "@/views/servers/ServersElement.vue";
import { useFilterStore } from "@/stores/filter";
import { useSettingsStore } from "@/stores/settings";
import { isGroup, useServersStore, type ServerGroup } from "@/stores/servers";
import { useLocalization } from "@/stores/localization";
import {
	playHoverSound,
	playMoveSound,
	playClickSound,
} from "@/utils/playSound";
import type { IServer } from "@/types/IServer";
import { useExpandedStateStore } from "@/stores/expandedState";

const filter = useFilterStore();
const settings = useSettingsStore();
const servers = useServersStore();
const expandedState = useExpandedStateStore();
const { t, locales } = useLocalization();

const headers = computed(() => {
	return [
		{ id: "name", name: t("SERVER_NAME") },
		{ id: "playersCount", name: t("PLAYERS") },
		// {id: "ping", name: t('PING')},
		{ id: "gameMode", name: t("GAMEMODE") },
		{ id: "language", name: t("LANGUAGE") },
	];
});

type SortByProperty = keyof (ServerGroup | IServer);
const sortBy = ref<SortByProperty>("playersCount");
const sortDirection = ref<number>(1); // 1 is desc, -1 is asc

function changeSortBy(newSortBy: keyof (ServerGroup | IServer)) {
	if (sortBy.value === newSortBy) {
		sortDirection.value = -sortDirection.value;
	} else {
		sortBy.value = newSortBy;
		sortDirection.value = 1;
	}
}

const sortItems = (a: IServer | ServerGroup, b: IServer | ServerGroup) => {
	if (settings.data.promotedOnTop && a.promoted != b.promoted) {
		return a.promoted ? -1 : 1;
	}

	if (!sortBy.value) {
		return 0;
	}

	const aSortBy = a[sortBy.value];
	const bSortBy = b[sortBy.value];

	if (aSortBy > bSortBy) {
		return -1 * sortDirection.value;
	}

	if (aSortBy < bSortBy) {
		return 1 * sortDirection.value;
	}

	return 0;
};

const normalizedFilters = computed(() => {
	const maxPlayers =
		!filter.maxPlayers || isNaN(+filter.maxPlayers) ? null : +filter.maxPlayers;
	const minPlayers =
		!filter.minPlayers || isNaN(+filter.minPlayers) ? null : +filter.minPlayers;
	const maxSlots =
		!filter.maxSlots || isNaN(+filter.maxSlots) ? null : +filter.maxSlots;
	const minSlots =
		!filter.minSlots || isNaN(+filter.minSlots) ? null : +filter.minSlots;
	// const maxPing = !filter.maxPing || isNaN(+filter.maxPing) ? null : +filter.maxPing;
	const query = filter.search.trim().toLowerCase();

	return {
		query,
		maxPlayers,
		minPlayers,
		maxSlots,
		minSlots,
	};
});

const filterServer = (server: IServer) => {
	const { maxPlayers, maxSlots, minPlayers, minSlots, query } =
		normalizedFilters.value;

	if (filter.hideEmpty && server.playersCount === 0) return false;
	if (filter.hideFull && server.playersCount === server.maxPlayersCount)
		return false;

	if (maxPlayers != null && server.playersCount > maxPlayers) return false;
	if (minPlayers != null && server.playersCount < minPlayers) return false;

	if (maxSlots != null && server.maxPlayersCount > maxSlots) return false;
	if (minSlots != null && server.maxPlayersCount < minSlots) return false;

	if (filter.hideLocked && server.passworded) return false;

	// if (maxPing != null && e.ping != -1 && e.ping != null && e.ping > maxPing) return false;

	return (
		server.name.toLowerCase().includes(query) ||
		locales.get(server.language)?.name.toLowerCase().includes(query) ||
		server.tags.some((tag) => tag.toLowerCase().includes(query))
	);
};

const filterItem = (serverOrGroup: IServer | ServerGroup) => {
	if (isGroup(serverOrGroup)) {
		const group = serverOrGroup;
		const { query } = normalizedFilters.value;

		if (filter.hideEmpty && group.playersCount === 0) return false;
		if (filter.hideFull && group.playersCount === group.maxPlayersCount)
			return false;

		return (
			group.name.toLowerCase().includes(query) || group.servers.some(filterItem)
		);
	}

	return filterServer(serverOrGroup);
};

const tableData = computed(() => {
	return servers.groupedServers
		.filter(filterItem)
		.sort(sortItems)
		.flatMap((serverOrGroup) => {
			if (
				isGroup(serverOrGroup) &&
				expandedState.expandedState.get(serverOrGroup.id)
			) {
				return [
					serverOrGroup,
					...serverOrGroup.servers.filter(filterServer).sort(sortItems),
				];
			}
			return [serverOrGroup];
		}) as (ServerGroup | IServer)[];
});
</script>

<template>
	<table class="servers-table">
		<thead>
			<tr>
				<th
					v-for="header in headers"
					@click="
						changeSortBy(header.id as SortByProperty);
						playClickSound();
					"
					:class="{ active: sortBy === header.id, [header.id]: true }"
					@mouseenter="playHoverSound"
				>
					<span>{{ header.name }}</span>
					<sort-desc v-if="sortBy === header.id && sortDirection === 1" />
					<sort-asc v-if="sortBy === header.id && sortDirection === -1" />
				</th>
			</tr>
		</thead>
		<tbody>
			<servers-element
				v-for="serverOrGroup in tableData"
				:key="
					isGroup(serverOrGroup) ? serverOrGroup.id : serverOrGroup.publicId
				"
				:item="serverOrGroup"
				@click="playMoveSound"
				@mouseenter="playHoverSound"
			/>
		</tbody>
	</table>
</template>

<style lang="scss">
@import "@/assets/_util.scss";
@import "@/assets/_palette.scss";

table.servers-table {
	width: 100%;
	border-collapse: collapse;
	border-spacing: 0;
	//padding-left: u(24);

	tr {
		cursor: pointer;
	}

	tbody tr {
		background: transparent;
		transition: background 0.2s ease;

		&:hover {
			background: rgba(white, 0.03);
		}

		&:active {
			background: rgba(white, 0.05);
		}
	}

	td,
	th {
		text-align: left;
		padding: u(24) 0;
		border-bottom: u(1) solid rgba(241, 242, 242, 0.1);
		vertical-align: top;
		font-weight: 500;

		&:not(:first-child) {
			width: u(160);
			overflow-x: hidden;
			text-overflow: ellipsis;

			&.gameMode {
				width: u(192);

				padding-right: u(32);

				[dir="rtl"] & {
					//padding-left: u(32);
					padding-right: unset;
				}
			}
		}

		td {
			&:not(:first-child) {
				&.gameMode {
					span {
						display: -webkit-box;
						-webkit-line-clamp: 3;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}
				}
			}
		}

		[dir="rtl"] & {
			&.players,
			&.gameMode,
			&.language {
				text-align: center;
			}
		}

		&:first-child {
			padding-left: u(44);
		}

		&:last-child {
			padding-right: u(22);
		}

		[dir="rtl"] & {
			text-align: right;

			&:first-child {
				padding-left: unset;
				padding-right: u(44);
			}

			&:last-child {
				padding-right: unset;
				padding-left: u(22);
			}
		}
	}

	th {
		padding: u(24) 0;
		font-size: u(18);
		color: rgba($text_light, 0.5);

		&.active {
			color: white;
		}

		svg {
			margin-left: u(12);

			[dir="rtl"] & {
				margin-left: unset;
				margin-right: u(12);
			}

			height: u(12);
		}
	}
}
</style>
