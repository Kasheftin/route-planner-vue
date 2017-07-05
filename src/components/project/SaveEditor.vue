<template>
	<div class="rp-modal-overlay" @click.self="$bus.$emit('closeModal')">
		<div class="rp-modal">
			<div class="rp-modal-header">
				<div class="rp-rcontrols">
					<a class="icon-times" href="javascript:void(0)" @click="$bus.$emit('closeModal')"></a>
				</div>
				<h4>Save Project</h4>
			</div>
			<div class="rp-modal-body pb0">
				<div class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-2" for="projectDescription">JSON</label>
						<div class="col-sm-10">
							<textarea class="form-control" v-model="json" readonly="readonly" rows="20" ref="textarea"></textarea>
						</div>
					</div>
					<div class="form-group">
						<div class="col-sm-10 col-sm-offset-2 text-right">
							<button class="btn btn-default btn-sm" ref="ccopy">Copy to Clipboard</button>
						</div>
					</div>
				</div>
				<Alert :data="alert" />
			</div>
			<div class="rp-modal-buttons clearfix">
				<div class="pull-right">
					<button class="btn btn-primary" @click="save">Save to Server</button>
					<button class="btn btn-default" @click="$bus.$emit('closeModal')">Close</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

import Clipboard from "clipboard";

export default {
	data: function() {
		return {
			alert: undefined
		}
	},
	computed: {
		json: function() {
			const out = {
				project: this.$store.getters["project/export"],
				viewport: this.$store.getters["viewport/viewport"]
			}
			return JSON.stringify(out,null,2);
		}
	},
	methods: {
		save: function() {
			this.$bus.$emit("makeRequest",{data:this.json,action:"save"},(resultType,result) => {
				if (resultType=="success") {
					this.$bus.$emit("success",result.message);
					this.alert = {type:"success",message:result.message};
					this.$store.dispatch("ensureProjectInProjectList",this.$store.getters["project/export"]);
					this.$bus.$emit("setRoute",this.$store.getters["project/export"]);
				}
				else {
					this.$bus.$emit("error",result.message);
					if (result.code=="privateIdMismatch") {
						this.alert = {
							type: "error",
							message: "The private key you are trying to save project with is incorrect. You can not overwrite the existing project, but you can clone it and save with the other (id, privateKey) pair.",
							buttons: [{
								label: "Clone project & save",
								class: "btn-success",
								action: () => {
									this.$store.dispatch("project/cloneProject").then(result => {
										this.$bus.$emit("success",result);
										this.save();
									}).catch(result => this.$bus.$emit("error",result));
								}
							}]
						};
					}
					else {
						this.alert = {type:"error",message:result.message};
					}
				}
			});
		}
	},
	mounted: function() {
		this.clipboard = new Clipboard(this.$refs.ccopy,{
			target: (trigger) => {
				return this.$refs.textarea;
			}
		});
		this.clipboard.on("success",e => {
			this.$bus.$emit("success","Project JSON data copied to clipboard.");
			this.alert = {type:"success",message:"Project JSON data copied to clipboard."};
			e.clearSelection();
		});
		this.clipboard.on("error",e => {
			this.$bus.$emit("error",e);
		});
	},
	beforeDestroy: function() {
		this.clipboard && this.clipboard.destroy();
	}
}

</script>