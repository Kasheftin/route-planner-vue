<template>
	<div>
		<gmap-marker
			v-for="r in results"
			v-if="r.geometry"
			:key="r.id"
			:position="r.geometry.location"
			:icon="{url:r.icon,scaledSize:iconSize}"
			:clickable="true"
			@click="toggleInfoWindow(r)"
		></gmap-marker>
		<gmap-info-window ref="infoWindow" v-if="!!r" :options="infoWindowOptions" :position="r.geometry.location" @closeclick="toggleInfoWindow()">
			<div class="rp-iwin">
				<h3 v-if="!!r.name">{{r.name}}</h3>
				<p class="rp-iwin-param" v-if="!!r.formatted_address">
					<span class="rp-iwin-param-field">Address: </span>
					<span class="rp-iwin-param-value">{{r.formatted_address}}</span>
				</p>
				<p class="rp-iwin-param" v-if="r.types">
					<span class="rp-iwin-param-field">Tags: </span>
					<span class="rp-iwin-param-value">{{r.types|commedArray}}</span>
				</p>
				<p class="rp-iwin-param" v-if="r.geometry.location">
					<span class="rp-iwin-param-field">Location: </span>
					<span class="rp-iwin-param-value">{{r.geometry.location|latlng}}</span>
				</p>
				<div class="rp-iwin-photos" v-if="r.thumbs">
					<img class="rp-iwin-photo" v-for="p in r.thumbs" :src="p" />
				</div>
				<p>
					<a href="javascript:void(0)" @click="addToProject(r)">Add to Map</a>
				</p>
			</div>
		</gmap-info-window>
	</div>
</template>

<script>
import {mapState} from "vuex";

export default {
	data: function() {
		return {
			r: undefined
		}
	},
	computed: {
		results: function() {
			const results = this.$store.getters["search/results"];
			(results||[]).forEach((r) => {
				r.thumbs = _.map((r.photos||[]).slice(0,2),(p) => {
					return p.getUrl({maxHeight:120,maxWidth:160});
				});
			});
			return results;
		},
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: -30
				}
			}
		},
		iconSize: function() {
			return new google.maps.Size(30,30);
		}
	},
	methods: {
		toggleInfoWindow: function(r) {
			if (!r || this.r==r) {
				this.r = undefined;
				return;
			}
			this.r = r;
		},
		addToProject: function(r) {
			this.$bus.$emit("tryAddSearchResult",r,(resultType) => {
				if (resultType=="success") {
					this.toggleInfoWindow();
				}
			});
		}
	},
	filters: {
		latlng: function(ar) {
			return ar.lat().toFixed(6)+", "+ar.lng().toFixed(6);
		},
		commedArray: function(ar) {
			console.log("commedArray",ar);
			return (ar||[]).join(", ");
		}
	},
	mounted: function() {
		this._clearSearchResults = () => {
			this.toggleInfoWindow();
		}
		this.$bus.$on("clearSearchResults",this._clearSearchResults);
	},
	beforeDestroy: function() {
		this._clearSearchResults && this.$bus.$off("clearSearchResults",this._clearSearchResults);
	}
}
</script>