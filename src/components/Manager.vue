<template>
	<div class="rp-modal-overlay">
		<div class="rp-modal">
			<div class="rp-modal-body pt0">
				<h1>Route Planner Vue v0.1</h1>
				<p class="lead">Simple free tool for planning routes</p>
				<p>It's the clone of my original Route Planner that was written to deeply understand vue.js.</p>
				<div class="rp-welcome-buttons">
					<button class="btn btn-default" @click="openNewProject">Create New Project</button>
					<button class="btn btn-default">Load Project</button>
					<button class="btn btn-default">Import Project JSON</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

import {mapActions} from "vuex";

export default {
	name: "ProjectManager",
	methods: {
		...mapActions("project",{
			"openNewProject": "openNewProject"
		})
	}
}

</script>