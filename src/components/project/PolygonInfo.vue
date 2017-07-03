<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="position" @closeclick="$bus.$emit('togglePolygonInfo')">
		<div class="rp-iwin">
			<template v-if="!editing">
				<h3 v-if="!!r.name">{{r.name}}</h3>
				<p v-html="compiledText"></p>
			</template>
			<div class="rp-iwin-note-editor" v-if="editing">
				<div class="form-group">
					<input type="text" class="form-control" v-model="name" placeholder="Polygon name" />
				</div>
				<div class="form-group">
					<textarea class="form-control" v-model="text" rows="5" ref="text" placeholder="Polygon description"></textarea>
				</div>
				<div class="form-group rp-colors">
					<template v-for="c in colors">
						<span class="rp-color" :class="{'-sel':color==c}" :style="{backgroundColor:c}" @click="color=c"></span>
					</template>
				</div>
			</div>
			<p class="rp-iwin-param" v-if="r.path">
				<span class="rp-iwin-param-field">Area: </span>
				<span class="rp-iwin-param-value">{{r.area|sq}}</span>
			</p>
			<p class="rp-iwin-actions" v-if="!editing">
				<a class="rp-iwin-action btn btn-primary btn-sm" href="javascript:void(0)" @click="edit()"><span class="icon-pencil"></span> Edit</a>
				<a class="rp-iwin-action btn btn-default btn-sm" href="javascript:void(0)" @click="remove()"><span class="icon-times"></span> Delete</a>
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
import config from "../../config";

export default {
	data: function() {
		return {
			r: undefined,
			editing: false,
			name: "",
			text: "",
			color: "",
			replacedPosition: undefined,
			colors: config.colors
		}
	},
	computed: {
		infoWindowOptions: function() {
			return {
				pixelOffset: {
					width: 0,
					height: 0
				}
			}
		},
		compiledText: function() {
			return Marked((this.r||{}).text,{sanitize:true});
		},
		position: function() {
			if (this.replacedPosition) return this.replacedPosition;
			if (!this.r || !this.r.path) return;
			let lat = 0;
			let lng = 0;
			this.r.path.forEach(p => {
				lat += p.lat;
				lng += p.lng;
			});
			console.log("lat,lng",lat,lng);
			return {lat:lat/this.r.path.length,lng:lng/this.r.path.length};
		}
	},
	methods: {
		edit: function() {
			this.name = this.r.name;
			this.text = this.r.text;
			this.color = this.r.color;
			this.editing = true;
			this.$nextTick(() => {
				this.$refs.text.focus();
			});
		},
		cancel: function() {
			this.name = "";
			this.text = "";
			this.color = "";
			this.editing = false;
		},
		save: function() {
			this.$store.dispatch("project/setShapeData",{id:this.r.id,name:this.name,text:this.text,color:this.color}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("toggleDotInfo");
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
		this._toggle = (data,editing,position) => {
			if (!data || (this.r && this.r==data.r)) {
				this.r = undefined;
				this.cancel();
				return;
			}
			this.replacedPosition = position;
			this.r = data;
			if (editing !== undefined) {
				editing ? this.edit() : this.cancel();
			}
		}
		this._show = (data,editing,position) => {
			if (data) {
				this.replacedPosition = position;
				this.r = data;
				if (editing !== undefined) {
					editing ? this.edit() : this.cancel();
				}
			}
		}
		this.$bus.$on("togglePolygonInfo",this._toggle);
		this.$bus.$on("showPolygonInfo",this._show);
	},
	beforeDestroy: function() {
		this._toggle && this.$bus.$off("togglePolygonInfo",this._toggle);
		this._show && this.$bus.$off("showPolygonInfo",this._show);
	}
}

</script>