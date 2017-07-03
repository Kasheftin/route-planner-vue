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
					<button class="btn btn-primary" @click="$bus.$emit('closeModal')">Save to Server</button>
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
			this.$store.dispatch("project/setProjectData",{name:this.name,description:this.description}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("closeModal");
			}).catch(result => this.$bus.$emit("error",result.msg));
		},
		saveToLocalStorage: function() {
			const p = new Promise((resolve,reject) => {
				const data = this.$store.getters["project/export"];
				const currentJSON = localStorage.getItem("rp-"+data.id);
				if (currentJSON && currentJSON.length>0) {
					const current = JSON.parse(currentJSON);
					if (current.privateId==data.privateId) return resolve(data);
					else return reject();
				}
				return resolve(data);
			});
			p.then(data => {
				this.$bus.$emit("success","Project data saved to LocalStorage.");
				this.alert = {type:"success",message:"Project data saved to LocalStorage."};
				console.log("save",data);
			}).catch(e => {
				console.log("reject",e);
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