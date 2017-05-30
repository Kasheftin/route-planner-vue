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
			<p>
				<a class="rp-settings-add-layer" href="javascript:void(0)" @click="addLayer()">Add Layer</a>
			</p>
		</div>
		<div class="rp-layers" ref="list">
			<ProjectSettingsLayer v-for="l in layers" v-on:selectLayer="selectLayer(l._id)" v-on:deselectLayer="selectLayer()" :key="l._id" :layer="l" :selected="l._id==selectedLayerId"></ProjectSettingsLayer>
		</div>
	</div>
</template>

<script>

import {mapActions,mapState} from "vuex";
import Sortable from "sortablejs";
import ProjectSettingsLayer from "./ProjectSettingsLayer.vue";

export default {
	data: function() {
		return {
			selectedLayerId: undefined
		}
	},
	computed: {
		...mapState("project",{
			name: state => state.data.name,
			description: state => state.data.description,
			layers: state => state.data.layers
		})
	},
	methods: {
		...mapActions({
			closeProject: "project/close"
		}),
		selectLayer: function(_id) {
			this.selectedLayerId = _id;
		},
		addLayer: function() {
			this.$store.dispatch("project/addLayer",{expanded:true}).then((newLayer) => {
				this.selectLayer(newLayer._id);
			});
		},
		saveProject: function() {
			var r = [
				"Project saved.",
				"Some error appeared with processing of the result.",
				"Some long text goes here. Includes over 250 glyphs in font format from the Glyphicon Halflings set. Glyphicons Halflings are normally not available for free, but their creator has made them available for Bootstrap free of cost. As a thank you, we only ask that you include a link back to Glyphicons whenever possible."
			]
			this.$bus.$emit("success",r[Math.floor(Math.random()*r.length)]);
		}
	},
	components: {
		ProjectSettingsLayer: ProjectSettingsLayer
	},
	mounted: function() {
		Sortable.create(this.$refs.list,{
			handle: ".rp-layer-header-title",
			onEnd: (e) => {
				this.$store.dispatch("project/moveLayer",e);
			}
		});
	}
}

</script>