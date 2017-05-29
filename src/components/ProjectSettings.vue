<template>
	<div class="rp-settings">
		<div class="rp-settings-inner">
			<div class="rp-rcontrols">
				<a class="fa fa-save" href="javascript:void(0)" @click="saveProject"></a>
				<a class="fa fa-cog" href="javascript:void(0)" @click="$bus.$emit('switchModal','ProjectInfoEditor')"></a>
				<a class="fa fa-times" href="javascript:void(0)" @click="closeProject"></a>
			</div>
			<h4>{{name}}</h4>
			<p v-if="description">{{description}}</p>
		</div>
	</div>
</template>

<script>

import {mapActions,mapState} from "vuex";

export default {
	computed: {
		...mapState("project",{
			name: state => state.data.name,
			description: state => state.data.description
		})
	},
	methods: {
		...mapActions({
			"closeProject": "project/close"
		}),
		"saveProject": function() {
			var r = [
				"Project saved.",
				"Some error appeared with processing of the result.",
				"Some long text goes here. Includes over 250 glyphs in font format from the Glyphicon Halflings set. Glyphicons Halflings are normally not available for free, but their creator has made them available for Bootstrap free of cost. As a thank you, we only ask that you include a link back to Glyphicons whenever possible."
			]
			this.$bus.$emit("success",r[Math.floor(Math.random()*r.length)]);
		}
	}
}

</script>