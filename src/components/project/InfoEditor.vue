<template>
	<div class="rp-modal-overlay" @click.self="$bus.$emit('closeModal')">
		<div class="rp-modal">
			<div class="rp-modal-header">
				<div class="rp-rcontrols">
					<a class="fa fa-times" href="javascript:void(0)" @click="$bus.$emit('closeModal')"></a>
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
							<textarea class="form-control" type="text" id="projectDescription" v-model="description"></textarea>
						</div>
					</div>
				</div>
			</div>
			<div class="rp-modal-buttons text-right">
				<button class="btn btn-primary" @click="save">Save</button>
				<button class="btn btn-default" @click="$bus.$emit('closeModal')">Cancel</button>
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
		this.name = this.$store.state.project.data.name;
		this.description = this.$store.state.project.data.description;
	},
	methods: {
		save: function() {
			this.$store.commit("project/updateInfo",{name:this.name,description:this.description});
			this.$bus.$emit("closeModal");
		}
	}
}

</script>