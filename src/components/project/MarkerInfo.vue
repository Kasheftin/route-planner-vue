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
				<textarea class="form-control" v-model="note" rows="5" ref="note"></textarea>
			</div>
			<p class="rp-iwin-actions" v-if="!editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="edit()"><span class="icon-pencil"></span> {{r.note?"Edit Note":"Add Note"}}</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="remove()"><span class="icon-times"></span> Delete</a>
				<a class="rp-iwin-action" v-if="!!r.url" :href="r.url" target="_blank">View on Google Maps</a>
			</p>
			<p class="rp-iwin-actions" v-if="editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="save()"><span class="icon-checkmark"></span> Save</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="cancel()"><span class="icon-times"></span> Cancel</a>
				<a class="rp-iwin-action" href="https://en.wikipedia.org/wiki/Markdown" target="_blank">Markdown supported</a>
			</p>
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
			note: ""
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
			this.$nextTick(() => {
				this.$refs.note.focus();
			});
		},
		cancel: function() {
			this.note = "";
			this.editing = false;
		},
		save: function() {
			this.$store.dispatch("project/setShapeData",{id:this.r.id,note:this.note}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.cancel();
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		remove: function() {
			this.$store.dispatch("project/removeShape",this.r).then(result => {
				this.$bus.$emit("success",result.msg);
				this.r = undefined;
			}).catch(result => this.$bus.$emit("error",result.msg));
		}
	},
	mounted: function() {
		this._toggle = (data) => {
			if (!data || (this.r && this.r.id==data.id)) {
				this.r = undefined;
				this.editing = false;
				return;
			}
			this.r = data;
		}
		this._show = (data) => {
			if (data) {
				this.r = data;
			}
		}
		this.$bus.$on("toggleMarkerInfo",this._toggle);
		this.$bus.$on("showMarkerInfo",this._show);
	},
	beforeDestroy: function() {
		this.$bus.$off("toggleMarkerInfo",this._toggle);
		this.$bus.$off("showMarkerInfo",this._show);
	}
}
</script>