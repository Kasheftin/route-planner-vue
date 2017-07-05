<template>
	<div class="rp-settings">
		<div class="rp-settings-inner">
			<div class="rp-rcontrols">
				<a class="icon-save" href="javascript:void(0)" @click="saveProject"></a>
				<a class="icon-cog" href="javascript:void(0)" @click="editProject"></a>
				<a class="icon-times" href="javascript:void(0)" @click="closeProject"></a>
			</div>
			<h4>{{name}}</h4>
			<p v-if="description" v-html="compiledDescription"></p>
			<p>
				<a class="rp-settings-add-layer" href="javascript:void(0)" @click="addLayer()">Add Layer</a>
			</p>
		</div>
		<Draggable :options="{handle:'.rp-layer-header-title'}" class="rp-layers" ref="list" @end="$store.dispatch('project/moveLayer',$event)">
			<Layer v-for="l in layers" :key="l.id" :layer="l" :selected="l.id==selectedLayerId" />
		</Draggable>
	</div>
</template>

<script>

import {mapState,mapGetters} from "vuex";
import Marked from "marked";
import Layer from "./Layer.vue";
import InfoEditor from "./InfoEditor.vue";
import SaveEditor from "./SaveEditor.vue";

export default {
	data: function() {
		return {
			selectedLayerId: undefined
		}
	},
	computed: {
		...mapState("project",{
			name: state => state.name,
			description: state => state.description
		}),
		...mapGetters("project",["layers"]),
		compiledDescription: function() {
			return Marked(this.$store.state.project.description,{sanitize:true});
		}
	},
	methods: {
		selectLayer: function(id) {
			this.selectedLayerId = id;
		},
		addLayer: function() {
			this.$store.dispatch("project/addLayer",{expanded:true}).then(result => {
				this.selectLayer(result.id);
				this.$bus.$emit("highlightLayer",result.id);
				this.$bus.$emit("success",result.msg);
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		saveProject: function() {
			this.$bus.$emit("switchModal",SaveEditor);
		},
		editProject: function() {
			this.$bus.$emit("switchModal",InfoEditor);
		},
		closeProject: function() {
			this.$store.dispatch("project/closeProject").then(result => {
				this.$bus.$emit("setRoute");
			}).catch(result => this.$bus.$emit("error",result));
		}
	},
	mounted: function() {
		if (this.layers.length>0) {
			this.selectLayer(this.layers[0].id);
		}
		this._updateLayersHeight = () => {
			const $list = $(this.$refs.list.$el);
			$list.css("max-height",$(window).height()-$list.offset().top-30);
		}
		this._tryAdd = (type,data,callback) => {
			this.$store.dispatch("project/addShape",{layerId:this.selectedLayerId,type:type,data:data}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("highlightLayer",this.selectedLayerId);
				callback && callback("success",result.shape);
			}).catch(result => {
				this.$bus.$emit("error",result.msg);
				callback && callback("error");
			});
			this._updateLayersHeight();
		}
		this._layerRemoved = (id) => {
			if (this.selectedLayerId==id) {
				this.selectLayer(undefined);
			}
		}
		this.$bus.$on("tryAdd",this._tryAdd);
		this.$bus.$on("layerRemoved",this._layerRemoved);
		this.$bus.$on("selectLayer",this.selectLayer);
		$(window).on("resize",this._updateLayersHeight);
		this._updateLayersHeight();
	},
	beforeDestroy: function() {
		this._tryAdd && this.$bus.$off("tryAdd",this._tryAdd);
		this._layerRemoved && this.$bus.$off("layerRemoved",this._layerRemoved);
		this.selectLayer && this.$bus.$off("selectLayer",this.selectLayer);
		this._updateLayersHeight && $(window).off("resize",this._updateLayersHeight);
	},
	components: {
		Layer
	}
}

</script>

<style lang="scss" scoped>
.rp-layers {
	overflow-y: auto;
}
</style>