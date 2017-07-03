<template>
	<div>
		<template v-for="s in shapes" v-if="layers[s.layerId].visible">
			<gmap-marker
				v-if="s.type=='marker'"
				:key="s.id"
				:position="s.position"
				:icon="{url:s.icon,scaledSize:markerIconSize,anchor:markerIconAnchor}"
				:clickable="true"
				@click="$bus.$emit('toggleMarkerInfo',s)"
			/>
			<gmap-marker
				v-if="s.type=='dot'"
				:key="s.id"
				:position="s.position"
				:icon="{url:s.icon,scaledSize:dotIconSize,anchor:dotIconAnchor}"
				:clickable="true"
				:draggable="true"
				@click="$bus.$emit('toggleDotInfo',s)"
				@dragend="updateDotPosition(s,$event)"
			/>
			<gmap-polygon
				v-if="s.type=='polygon'"
				:key="s.id"
				:draggable="true"
				:editable="true"
				:options="{strokeColor:s.color,fillColor:s.color,strokeOpacity:0.8,strokeWeight:3,fillOpacity:0.35}"
				:path="s.path"
				@path_changed="updatePolygonPath(s,$event)"
				@rightclick="removePolygonPoint(s,$event)"
				@click="showPolygonInfo(s,$event)"
			/>
		</template>
	</div>
</template>

<script>
import {mapState} from "vuex";

export default {
	computed: {
		...mapState("project",{
			shapes: state => state.shapes,
			layers: state => state.layers
		}),
		markerIconSize: function() {
			return new google.maps.Size(30,30);
		},
		markerIconAnchor: function() {
			return new google.maps.Point(15,15);
		},
		dotIconSize: function() {
			return new google.maps.Size(22,40);
		},
		dotIconAnchor: function() {
			return new google.maps.Point(11,40);
		}
	},
	methods: {
		updateDotPosition: function(shape,data) {
			this.$store.dispatch("project/setShapeData",{id:shape.id,position:{lat:data.latLng.lat(),lng:data.latLng.lng()}}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("updateDotGeocode",shape,"coordsUpdated");
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		updatePolygonPath: function(shape,data) {
			const path = _.map(data.getArray(),p=>{return {lat:p.lat(),lng:p.lng()}});
			this.$store.dispatch("project/setShapeData",{id:shape.id,path:path}).then(result => {
				this.$bus.$emit("updatePolygonArea",shape);
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		removePolygonPoint: function(shape,data) {
			if (data.vertex===0||data.vertex>0) {
				const path = [
					...shape.path.slice(0,data.vertex),
					...shape.path.slice(data.vertex+1)
				];
				if (path.length>2) {
					this.$store.dispatch("project/setShapeData",{id:shape.id,path:path}).then(result => {
						this.$bus.$emit("updatePolygonArea",shape);
					}).catch(result => this.$bus.$emit("error",result.msg));
				}
				else {
					this.$store.dispatch("project/removeShape",shape).then(result => {
					}).catch(result => this.$bus.$emit("error",result.msg));
				}
			}
		},
		showPolygonInfo: function(shape,e) {
			this.$bus.$emit("showPolygonInfo",shape,undefined,{lat:e.latLng.lat(),lng:e.latLng.lng()});
		}
	}
}
</script>