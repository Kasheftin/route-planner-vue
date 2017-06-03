<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="r.position" @closeclick="$bus.$emit('toggleMarkerInfo')">
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
			<p class="rp-iwin-param" v-if="r.position">
				<span class="rp-iwin-param-field">Location: </span>
				<span class="rp-iwin-param-value">{{r.position|latlng}}</span>
			</p>
			<div class="rp-iwin-photos clearfix" v-if="thumbs">
				<a class="rp-iwin-photo" href="javascript:void(0)" v-for="p in thumbs" @click="" :style="{backgroundImage:'url('+p.thumb+')'}"><img class="rp-iwin-photo-img" :src="p.thumb" /></a>
			</div>
			<div class="rp-iwin-note" v-if="!editing&&!!r.note">
				<div class="alert alert-info" v-html="compiledNote"></div>
			</div>
			<div class="rp-iwin-note-editor" v-if="editing">
				<textarea class="form-control" v-model="note" rows="5"></textarea>
			</div>
			<p class="rp-iwin-actions" v-if="!editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="edit()"><i class="fa fa-pencil"></i> {{r.note?"Edit Note":"Add Note"}}</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="remove()"><i class="fa fa-trash"></i> Delete</a>
				<a class="rp-iwin-action" v-if="!!r.url" :href="r.url" target="_blank">View on Google Maps</a>
			</p>
			<p class="rp-iwin-actions" v-if="editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="save()"><i class="fa fa-check"></i> Save</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="cancel()"><i class="fa fa-times"></i> Cancel</a>
				<a class="rp-iwin-action" href="https://en.wikipedia.org/wiki/Markdown" target="_blank">Markdown supported</a>
			</p>
		</div>
	</gmap-info-window>
</template>

<script>
import Velocity from "velocity-animate";
import Marked from "marked";

export default {
	data: function() {
		return {
			r: undefined,
			editing: false,
			note: ""
		}
	},
	computed: {
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: -30
				}
			}
		},
		thumbs: function() {
			if (!this.r) return [];
			return (this.r.photos||[]).slice(0,2);
		},
		compiledNote: function() {
			return Marked(this.r.note,{sanitize:true});
		}
	},
	methods: {
		edit: function() {
			this.note = this.r.note;
			this.editing = true;
		},
		cancel: function() {
			this.note = "";
			this.editing = false;
		},
		save: function() {
			this.$store.dispatch("project/updateShapeNote",{id:this.r.id,note:this.note});
			this.note = "";
			this.editing = false;
		},
		remove: function() {
			this.$store.dispatch("project/removeShape",this.r.id);
			this.r = undefined;
		},
		animBeforeEnter: function(el) {
			el.style.height = 0;
		},
		animEnter: function(el,done) {
			Velocity(el,{height:$(el).children().eq(0).outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		animLeave: function(el,done) {
			Velocity(el,{height:0},{duration:300,complete:done});
		}
	},
	mounted: function() {
		this._toggleMarkerInfo = (data) => {
			if (!data || (this.r && this.r.id==data.id)) {
				this.r = undefined;
				return;
			}
			this.r = data;
		}
		this._showMarkerInfo = (data) => {
			if (data) {
				this.r = data;
			}
		}
		this.$bus.$on("toggleMarkerInfo",this._toggleMarkerInfo);
		this.$bus.$on("showMarkerInfo",this._showMarkerInfo);
	},
	beforeDestroy: function() {
		this.$bus.$off("toggleMarkerInfo",this._toggleMarkerInfo);
		this.$bus.$off("showMarkerInfo",this._showMarkerInfo);
	}
}
</script>