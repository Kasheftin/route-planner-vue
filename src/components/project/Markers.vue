<template>
	<div>
		<template v-for="l in layers">
			<template v-if="l.visible && l.shapes.length>0">
				<template v-for="s in l.shapes">
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
				</template>
			</template>
		</template>
	</div>
</template>

<script>
import {mapActions,mapState} from "vuex";

export default {
	computed: {
		...mapState("project",{
			layers: state => state.data.layers
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
			data.id = shape.id;
			this.$store.dispatch("project/updateDotPositionPromise",data).then((msg) => {
				this.$bus.$emit("updateDotGeocode",shape,"coordsUpdated");
				this.$bus.$emit("success",msg);
			}).catch((msg) => this.$bus.$emit("error",msg));
		}
	}
}
</script>