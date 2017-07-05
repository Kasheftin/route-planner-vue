<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="r.geometry.location" @closeclick="$bus.$emit('toggleDetailedResult')">
		<div class="rp-iwin">
			<h3 v-if="!!r.name">{{r.name}}</h3>
			<p class="rp-iwin-param" v-if="!!r.formatted_address">
				<span class="rp-iwin-param-field">Address: </span>
				<span class="rp-iwin-param-value">{{r.formatted_address}}</span>
			</p>
			<p class="rp-iwin-param" v-if="!!r.international_phone_number">
				<span class="rp-iwin-param-field">Phone number: </span>
				<span class="rp-iwin-param-value"><a :href="'tel:'+r.international_phone_number">{{r.international_phone_number}}</a></span>
			</p>
			<p class="rp-iwin-param" v-if="r.types">
				<span class="rp-iwin-param-field">Tags: </span>
				<span class="rp-iwin-param-value">{{r.types|commedArray}}</span>
			</p>
			<p class="rp-iwin-param" v-if="r.geometry.location">
				<span class="rp-iwin-param-field">Location: </span>
				<span class="rp-iwin-param-value">{{r.geometry.location|latlng}}</span>
			</p>
			<div class="rp-iwin-photos clearfix" v-if="thumbs">
				<a class="rp-iwin-photo" href="javascript:void(0)" v-for="p in thumbs" @click="" :style="{backgroundImage:'url('+p+')'}"><img class="rp-iwin-photo-img" :src="p" /></a>
			</div>
			<p class="rp-iwin-actions">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="addToProject()"><span class="icon-plus"></span> Add to Map</a>
				<a class="rp-iwin-action" v-if="!!r.url" :href="r.url" target="_blank">View on Google Maps</a>
			</p>
		</div>
	</gmap-info-window>
</template>

<script>

export default {
	data: function() {
		return {
			r: undefined,
			infoWindowType: "marker"
		}
	},
	computed: {
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: (this.infoWindowType=="poi"?-5:-30)
				}
			}
		},
		thumbs: function() {
			return _.map((this.r.photos||[]).slice(0,2),(p) => {
				console.log(p,p.getUrl({maxHeight:240,maxWidth:360}),p.getUrl({maxHeight:1280,maxWidth:1920}));
				return p.getUrl({maxHeight:240,maxWidth:360});
			});
		}
	},
	methods: {
		addToProject: function() {
			this.$bus.$emit("tryAdd","marker",this.r,(resultType) => {
				if (resultType=="success") {
					this.$bus.$emit("toggleDetailedResult");
				}
			});

		}
	},
	mounted: function() {
		this._toggleDetailedResult = (placeId,infoWindowType) => {
			if (!placeId || (this.r && this.r.placeId==placeId)) {
				this.r = undefined;
				return;
			}
			this.$bus.$emit("getDetailedResult",placeId,(resultType,result) => {
				if (resultType=="success") {
					console.log("showDetailedResult",result);
					this.infoWindowType = infoWindowType;
					this.r = result;
				}
				else {
					return this.$bus.$emit("error","Failed to receive detailed data about this place");
				}
			});
		}
		this.$bus.$on("toggleDetailedResult",this._toggleDetailedResult);
	},
	beforeDestroy: function() {
		this._toggleDetailedResult && this.$bus.$off("toggleDetailedResult",this._toggleDetailedResult);
	}
}

</script>