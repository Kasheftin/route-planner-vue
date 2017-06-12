<template>
	<gmap-info-window v-if="!!r" :options="infoWindowOptions" :position="r.position" @closeclick="$bus.$emit('toggleDotInfo')">
		<div class="rp-iwin">
			<template v-if="!editing">
				<h3 v-if="!!r.name">{{r.name}}</h3>
				<p v-html="compiledText"></p>
			</template>
			<div class="rp-iwin-note-editor" v-if="editing">
				<div class="form-group">
					<input type="text" class="form-control" v-model="name" placeholder="Marker name" />
				</div>
				<div class="form-group">
					<textarea class="form-control" v-model="text" rows="5" ref="text" placeholder="Marker description"></textarea>
				</div>
			</div>
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
					height: -40
				}
			}
		},
		compiledText: function() {
			return Marked((this.r||{}).text,{sanitize:true});
		}
	},
	methods: {
		edit: function() {
			this.name = this.r.name;
			this.text = this.r.text;
			this.editing = true;
			this.$nextTick(() => {
				this.$refs.text.focus();
			});
		},
		cancel: function() {
			this.name = "";
			this.text = "";
			this.editing = false;
		},
		save: function() {
			this.$store.dispatch("project/updateDotDataPromise",{id:this.r.id,name:this.name,text:this.text}).then((msg) => {
				this.cancel();
				this.$bus.$emit("success",msg);
			}).catch((msg) => this.$bus.$emit("error",msg));
		},
		remove: function() {
			this.$store.dispatch("project/removeShapePromise",this.r.id).then((msg) => {
				this.r = undefined;
				this.$bus.$emit("success",msg);
			}).catch((msg) => this.$bus.$emit("error",msg));
		}
	},
	mounted: function() {
		this._toggle = (data,editing) => {
			if (!data || (this.r && this.r==data.r)) {
				this.r = undefined;
				this.cancel();
				return;
			}
			this.r = data;
			editing ? this.edit() : this.cancel();
		}
		this._show = (data,editing) => {
			if (data) {
				this.r = data;
				editing ? this.edit() : this.cancel();
			}
		}
		this.$bus.$on("toggleDotInfo",this._toggle);
		this.$bus.$on("showDotInfo",this._show);
	},
	beforeDestroy: function() {
		this._toggle && this.$bus.$off("toggleDotInfo",this._toggle);
		this._show && this.$bus.$off("showDotInfo",this._show);
	}
}

</script>