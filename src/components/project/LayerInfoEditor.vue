<template>
	<div class="rp-modal-overlay" @click.self="$bus.$emit('closeModal')">
		<div class="rp-modal">
			<div class="rp-modal-header">
				<div class="rp-rcontrols">
					<a class="fa fa-times" href="javascript:void(0)" @click="$bus.$emit('closeModal')"></a>
				</div>
				<h4>Layer Settings</h4>
			</div>
			<div class="rp-modal-body">
				<div class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-3" for="layerName">Layer Name</label>
						<div class="col-sm-9">
							<input class="form-control" type="text" id="layerName" v-model="name">
						</div>
					</div>
					<div class="form-group">
						<div class="col-sm-9 col-sm-offset-3">
							<div class="checkbox">
								<label>
									<input type="checkbox" v-model="visible"> Visible
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="rp-modal-buttons">
				<div class="pull-left">
					<button class="btn btn-danger" @click="remove">Delete Layer</button>
				</div>
				<div class="pull-right">
					<button class="btn btn-primary" @click="save">Save</button>
					<button class="btn btn-default" @click="$bus.$emit('closeModal')">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

export default {
	props: ["layer"],
	data: function() {
		return  {
			name: "",
			visible: false
		}
	},
	created: function() {
		console.log("this.layer",this.layer);
		this.name = (this.layer||{}).name||"";
		this.visible = (this.layer||{}).visible||false;
	},
	methods: {
		save: function() {
			this.$store.dispatch("project/updateLayerInfo",{id:(this.layer||{}).id,name:this.name,visible:this.visible}).then((msg) => {
				this.$bus.$emit("success",msg);
				this.$bus.$emit("closeModal");
			}).catch((msg) => this.$bus.$emit("error",msg));
		},
		remove: function() {
			this.$store.dispatch("project/removeLayer",(this.layer||{}).id).then((msg) => {
				this.$bus.$emit("success",msg);
				this.$bus.$emit("closeModal");
			}).catch((msg) => this.$bus.$emit("error",msg));
		}
	}
}

</script>