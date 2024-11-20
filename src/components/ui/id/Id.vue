<script setup lang="ts">
import { useId } from "vue";

const id = useId();
</script>

<template>
	<slot :id="id" />
</template>
