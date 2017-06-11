<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="r.position" @closeclick="$bus.$emit('toggleMarkerInfo')">
		<div class="rp-iwin">
			<template v-if="!editing">
				<h3 v-if="!!r.name">{{r.name}}</h3>
				<p v-html="compiledText"></p>
			</template>
			<template> v-if="editing">
			</template>
		</div>
	</gmap-info-window>
</template>

<script>
import Marked from "marked";

export default {
	data: function() {
		return {
			r: undefined,
			editing: false,
			name: "",
			text: ""
		}
	},
	computed: {
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: -10
				}
			}
		},
		compiledText: function() {
			return Marked((this.r||{}).text,{sanitize:true});
		},
		mounted: function() {
		},
		beforeDestroy: function() {
		}
	}
}

</script>