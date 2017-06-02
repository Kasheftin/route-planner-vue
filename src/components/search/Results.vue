<template>
	<div>
		<gmap-marker
			v-for="r in results"
			v-if="r.location"
			:key="r.id"
			:position="r.location"
			:icon="{url:r.icon,scaledSize:iconSize,anchor:iconAnchor}"
			:clickable="true"
			@click="$bus.$emit('toggleDetailedResult',r.id,'marker')"
		></gmap-marker>
	</div>
</template>

<script>
import {mapState} from "vuex";

export default {
	computed: {
		...mapState("search",{
			results: store => store.results
		}),
		iconSize: function() {
			return new google.maps.Size(30,30);
		},
		iconAnchor: function() {
			return new google.maps.Point(15,15);
		}
	}
}
</script>