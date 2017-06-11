<template>
	<div class="rp-tools">
		<button class="btn btn-default" :class="{'-active':tool=='hand'}" @click="$store.dispatch('tool/setTool','hand')">
			<span class="icon-handdrag"></span>
		</button>
		<button class="btn btn-default" :class="{'-active':tool=='marker'}" @click="$store.dispatch('tool/setTool','marker')">
			<span class="icon-mapmarker"></span>
		</button>
		<button class="btn btn-default" :class="{'-active':tool=='path'}" @click="$store.dispatch('tool/setTool','path')">
			<span class="icon-directions"></span>
		</button>
		<button class="btn btn-default" :class="{'-active':tool=='path'}" @click="$store.dispatch('tool/setTool','path')">
			<span class="icon-transform"></span>
		</button>
	</div>
</template>

<script>
export default {
	computed: {
		tool: function() {
			return this.$store.state.tool.name;
		}
	}
}
</script>