<template>
	<div>
		<gmap-marker
			v-for="r in markers"
			v-if="r.position"
			:key="r.id"
			:position="r.position"
			:icon="{url:r.icon,scaledSize:iconSize,anchor:iconAnchor}"
			:clickable="true"
			@click="$bus.$emit('toggleMarkerInfo',r)"
		></gmap-marker>
	</div>
</template>

<script>
export default {
	computed: {
		markers: function() {
			const data = [];
			this.$store.state.project.data.layers.forEach((l) => {
				if (l.visible && l.shapes.length>0) {
					l.shapes.forEach((s) => {
						if (s.type=="marker") {
							data.push(s);
						}
					})
				}
			})
			console.log("markers",data);
			return data;
		},
		iconSize: function() {
			return new google.maps.Size(30,30);
		},
		iconAnchor: function() {
			return new google.maps.Point(15,15);
		}
	}
}
</script>