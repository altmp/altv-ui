<script setup lang="ts">
import { ListboxContent, ListboxRoot, ListboxItem } from "radix-vue";
import EyeIcon from "@/icons/eye.svg?component";
import EyeOffIcon from "@/icons/eye-off.svg?component";
import { computed } from "vue";
import { ConsoleContextInjectionKey } from "./console";
import { injectContext } from "@/utils/injectContext";
import { useSettingsStore } from "@/stores/settings";

const consoleContext = injectContext(ConsoleContextInjectionKey);
const settings = useSettingsStore();

const resources = computed(() => {
	const entries = consoleContext.entries.value;
	if (entries.size === 0) return [];
	const set = new Set<string>();
	for (let i = 0; i < entries.size; i++) {
		const entry = entries.get(i)!;
		set.add(entry.resource || "");
	}
	return Array.from(set).sort();
});

const visibleResources = computed({
	get: () => {
		return resources.value.filter(
			(resource) => !settings.data.hiddenLogResources.includes(resource),
		);
	},
	set: (newValue) => {
		settings.data.hiddenLogResources = resources.value.filter(
			(resource) => !newValue.includes(resource),
		);
		settings.save("hiddenLogResources");
	},
});
</script>

<template>
	<ListboxRoot
		:multiple="true"
		:highlight-on-hover="true"
		v-model="visibleResources"
	>
		<ListboxContent class="p-1">
			<div
				v-if="resources.length === 0"
				class="mx-auto py-2 text-center text-xs text-white/50"
			>
				No resources
			</div>
			<ListboxItem
				v-else
				v-for="resource of resources"
				:key="resource"
				:value="resource"
				class="relative flex w-full select-none items-center justify-between gap-2 rounded py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-white/5 data-[disabled]:opacity-50"
			>
				<span class="flex flex-1 items-center gap-2 text-sm text-stone-50">
					{{ resource === "" ? "alt:V Core" : resource }}
				</span>
				<div class="absolute right-2 top-2">
					<component
						:is="
							settings.data.hiddenLogResources.includes(resource)
								? EyeOffIcon
								: EyeIcon
						"
						class="size-4 stroke-1.5 text-white/60"
					/>
				</div>
			</ListboxItem>
		</ListboxContent>
	</ListboxRoot>
</template>
