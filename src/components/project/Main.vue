<template>
	<div class="rp-settings">
		<div class="rp-settings-inner">
			<div class="rp-rcontrols">
				<a class="icon-save" href="javascript:void(0)" @click="saveProject"></a>
				<a class="icon-cog" href="javascript:void(0)" @click="editProject"></a>
				<a class="icon-times" href="javascript:void(0)" @click="closeProject"></a>
			</div>
			<h4>{{name}}</h4>
			<p v-if="description">{{description}}</p>
			<p>
				<a class="rp-settings-add-layer" href="javascript:void(0)" @click="addLayer()">Add Layer</a>
			</p>
		</div>
		<Draggable :options="{handle:'.rp-layer-header-title'}" class="rp-layers" ref="list" @end="$store.dispatch('project/moveLayer',$event)">
			<Layer v-for="l in layers" v-on:selectLayer="selectLayer(l.id)" v-on:deselectLayer="selectLayer()" :key="l.id" :layer="l" :selected="l.id==selectedLayerId" />
		</Draggable>
	</div>
</template>

<script>

import {mapActions,mapState} from "vuex";
import Layer from "./Layer.vue";
import InfoEditor from "./InfoEditor.vue";

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
		selectLayer: function(id) {
			this.selectedLayerId = id;
		},
		addLayer: function() {
			this.$store.dispatch("project/addLayerPromise",{expanded:true}).then((newLayer) => {
				this.selectLayer(newLayer.id);
			});
		},
		saveProject: function() {
			var r = [
				"Project saved.",
				"Some error appeared with processing of the result.",
				"Some long text goes here. Includes over 250 glyphs in font format from the Glyphicon Halflings set. Glyphicons Halflings are normally not available for free, but their creator has made them available for Bootstrap free of cost. As a thank you, we only ask that you include a link back to Glyphicons whenever possible."
			]
			this.$bus.$emit("success",r[Math.floor(Math.random()*r.length)]);
		},
		editProject: function() {
			this.$bus.$emit("switchModal",InfoEditor);
		}
	},
	mounted: function() {
		this._updateLayersHeight = () => {
			const $list = $(this.$refs.list.$el);
			$list.css("max-height",$(window).height()-$list.offset().top-30);
			console.log("_updateLayersHeight",$(window).height()-$list.offset().top-30);
		}
		$(window).on("resize",this._updateLayersHeight);
		this._updateLayersHeight();

		if (this.layers.length>0) {
			this.selectedLayerId = this.layers[0].id;
		}

		this._tryAddSearchResult = (r,callback) => {
			this.$store.dispatch("project/addShapePromise",{layerId:this.selectedLayerId,type:"marker",data:r}).then((msg) => {
				this.$bus.$emit("success",msg);
				this.$bus.$emit("highlightLayer",this.selectedLayerId);
				callback && callback("success");
			}).catch((msg) => {
				this.$bus.$emit("error",msg);
				callback && callback("error");
			});
			this._updateLayersHeight();
		}
		this._tryAddDot = (data,callback) => {
			this.$store.dispatch("project/addShapePromise",{layerId:this.selectedLayerId,type:"dot",data:data}).then((msg) => {
				this.$bus.$emit("success",msg);
				this.$bus.$emit("highlightLayer",this.selectedLayerId);
				callback && callback("success");
			}).catch((msg) => {
				this.$bus.$emit("error",msg);
				callback && callback("error");
			});
		}
		this._layerRemoved = (id) => {
			if (this.selectedLayerId==id) {
				this.selectedLayerId = undefined;
			}
		}
		this.$bus.$on("tryAddSearchResult",this._tryAddSearchResult);
		this.$bus.$on("tryAddDot",this._tryAddDot);
		this.$bus.$on("layerRemoved",this._layerRemoved);
	},
	beforeDestroy: function() {
		this._tryAddSearchResult && this.$bus.$off("tryAddSearchResult",this._tryAddSearchResult);
		this._tryAddDot && this.$bus.$off("tryAddDot",this._tryAddDot);
		this._layerRemoved && this.$bus.$off("layerRemoved",this._layerRemoved);
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