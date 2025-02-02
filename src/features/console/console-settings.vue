<script setup lang="ts">
import { Label } from "radix-vue";
import { Id } from "@/components/ui/id";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();
</script>

<template>
	<div class="wrapper">
		<ul class="grid">
			<li class="flex items-center gap-2 p-3">
				<Id v-slot="{ id }">
					<Checkbox
						:id="id"
						size="sm"
						:checked="settings.data.showLogCopyButton"
						@update:checked="
							(newChecked) => {
								settings.data.showLogCopyButton = newChecked;
								settings.save('showLogCopyButton');
							}
						"
					/>
					<Label :for="id" class="truncate text-sm"> Show copy button </Label>
				</Id>
			</li>
			<li class="flex items-center gap-2 p-3">
				<Id v-slot="{ id }">
					<Checkbox
						:id="id"
						size="sm"
						:checked="settings.data.showLogTime"
						@update:checked="
							(newChecked) => {
								settings.data.showLogTime = newChecked;
								settings.save('showLogTime');
							}
						"
					/>
					<Label :for="id" class="truncate text-sm"> Show time </Label>
				</Id>
			</li>
			<li class="flex items-center justify-between gap-3 px-3 py-2">
				<Id v-slot="{ id }">
					<Label :for="id" class="flex-1 truncate text-sm">Time format</Label>
					<input
						:id="id"
						:value="settings.data.logTimeFormat"
						class="min-w-0 flex-1 rounded bg-stone-700 px-1.5 py-1 text-sm text-white/75 outline-none ring-white/10 transition-[background-color,box-shadow] focus-visible:ring-2"
						@change="
							(event) => {
								const value = (event.target as HTMLInputElement).value;
								settings.data.logTimeFormat = value;
								settings.save('logTimeFormat');
							}
						"
					/>
				</Id>
			</li>
		</ul>
	</div>
</template>

<style lang="postcss" scoped>
.wrapper {
	container-type: inline-size;
}

ul {
	display: grid;
	grid-template-columns: repeat(1, minmax(0, 1fr));
}

ul > li {
	border-bottom: 1px solid theme("colors.stone.600");
}

ul > li:last-child {
	border-bottom: 0;
}

@container (min-width: 480px) {
	ul {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	ul > li:nth-last-child(2):nth-child(odd),
	ul > li:nth-last-child(1):nth-child(even) {
		border-bottom: 0;
	}
}

@container (min-width: 640px) {
	ul {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	ul > li:nth-last-child(3):nth-child(3n + 1),
	ul > li:nth-last-child(2):nth-child(3n + 2),
	ul > li:nth-last-child(1):nth-child(3n) {
		border-bottom: 0;
	}
}
</style>
