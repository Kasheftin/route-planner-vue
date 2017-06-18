<template>
	<div class="rp-modal-overlay" @click.self="$bus.$emit('closeModal')">
		<div class="rp-modal">
			<div class="rp-modal-header">
				<div class="rp-rcontrols">
					<a class="icon-times" href="javascript:void(0)" @click="$bus.$emit('closeModal')"></a>
				</div>
				<h4>Project Settings</h4>
			</div>
			<div class="rp-modal-body">
				<div class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-3" for="projectName">Project Name</label>
						<div class="col-sm-9">
							<input class="form-control" type="text" id="projectName" v-model="name">
						</div>
					</div>
					<div class="form-group">
						<label class="control-label col-sm-3" for="projectDescription">Description</label>
						<div class="col-sm-9">
							<textarea class="form-control" type="text" id="projectDescription" v-model="description" rows="5"></textarea>
						</div>
					</div>
				</div>
			</div>
			<div class="rp-modal-buttons clearfix">
				<div class="pull-left">
					<a class="rp-modal-buttons-text" href="https://en.wikipedia.org/wiki/Markdown" target="_blank">Markdown supported</a>
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
	data: function() {
		return  {
			name: "",
			description: ""
		}
	},
	created: function() {
		this.name = this.$store.state.project.name;
		this.description = this.$store.state.project.description;
	},
	methods: {
		save: function() {
			this.$store.dispatch("project/setProjectData",{name:this.name,description:this.description}).then(result => {
				this.$bus.$emit("success",result.msg);
				this.$bus.$emit("closeModal");
			}).catch(result => this.$bus.$emit("error",result.msg));
		}
	}
}

</script>