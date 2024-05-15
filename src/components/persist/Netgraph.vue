<script setup lang="ts">
import { useUIStore } from "@/stores/ui";

const ui = useUIStore();
</script>

<template>
	<section>
		<table class="netgraph">
			<tbody>
				<tr>
					<td>FPS:</td>
					<td>{{ ui.netgraph.fps }}</td>
				</tr>
				<tr>
					<td>RTT:</td>
					<td>{{ ui.netgraph.rtt }} ms</td>
				</tr>
				<tr>
					<td>TX:</td>
					<td>{{ (ui.netgraph.tx / 1024).toFixed(2) }} Kbps</td>
				</tr>
				<tr>
					<td>RX:</td>
					<td>{{ (ui.netgraph.rx / 1024).toFixed(2) }} Kbps</td>
				</tr>
	            <tr>
	                <td>PPS:</td>
	                <td>{{ ui.netgraph.pps }}</td>
	            </tr>
			</tbody>
		</table>
	</section>
</template>

<style lang="scss" scoped>
.netgraph {
	position: fixed;
	left: u(40);
	bottom: 0;
	color: rgba(255, 255, 255, 0.75);
	margin: 2em;
	font-size: u(14);
	font-weight: 500;
	text-shadow:
		0 2px 0 rgba(0, 0, 0, 0.5),
		0 -2px 0 rgba(0, 0, 0, 0.5),
		2px 0 0 rgba(0, 0, 0, 0.5),
		-2px 0 0 rgba(0, 0, 0, 0.5);
	line-height: 1.2;
	pointer-events: none;
	z-index: 101;
}

.netgraph tr td {
	font-weight: 500;
}
.netgraph tr td:first-of-type {
	padding-right: 0.5em;
}
</style>
