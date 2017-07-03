<template>
	<div class="rp-tools">
		<button class="btn btn-default" :class="{'-active':tool=='hand'}" @click="$store.dispatch('tool/setTool','hand')">
			<span class="icon-handdrag"></span>
		</button>
		<button class="btn btn-default" :class="{'-active':tool=='marker'}" @click="$store.dispatch('tool/setTool','marker')">
			<span class="icon-mapmarker"></span>
		</button>
		<button class="btn btn-default" @click="tryAddRoute">
			<span class="icon-directions"></span>
		</button>
		<button class="btn btn-default" @click="tryAddPolygon">
			<span class="icon-transform"></span>
		</button>
		<button class="btn btn-default" @click="gotoCurrentPosition">
			<span class="icon-target"></span>
		</button>
	</div>
</template>

<script>
export default {
	computed: {
		tool: function() {
			return this.$store.state.tool.name;
		}
	},
	methods: {
		tryAddRoute: function() {
			this.$bus.$emit("tryAdd","route",{editing:true},(resultType,shape) => {
				this.$store.dispatch("project/switchLayerExpanded",{id:shape.layerId,expanded:true}).then(result => {
					this.$bus.$emit("shapeFocus",shape);
				}).catch(result => this.$bus.$emit("error",result));
			});
		},
		tryAddPolygon: function() {
			this.$bus.$emit("tryAddPolygon",(resultType,shape) => {
				this.$store.dispatch("project/switchLayerExpanded",{id:shape.layerId,expanded:true}).then(result => {
					this.$bus.$emit("updatePolygonArea",shape);
					this.$bus.$emit("showPolygonInfo",shape,true);
				}).catch(result => this.$bus.$emit("error",result));
			});
		},
		gotoCurrentPosition: function() {
			navigator.geolocation && navigator.geolocation.getCurrentPosition(position => {
				this.$store.dispatch("viewport/update",{what:"center",e:new google.maps.LatLng(position.coords.latitude,position.coords.longitude)});
				this.$store.dispatch("viewport/update",{what:"zoom",e:14});
			});
		}
	}
}
</script>