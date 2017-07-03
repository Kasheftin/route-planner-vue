<template>
	<div class="rp-modal-overlay">
		<div class="rp-modal">
			<div class="rp-modal-body pt0">
				<h1>Route Planner Vue v0.1</h1>
				<p class="lead">Simple free tool for planning routes</p>
				<p>It's the clone of my original Route Planner that was written to deeply understand vue.js.</p>
				<div class="rp-welcome-buttons">
					<button class="btn btn-default" @click="openNewProject">Create New Project</button>
					<button class="btn btn-default">Load Project</button>
					<button class="btn btn-default" @click="switchImport">Import Project JSON</button>
				</div>
				<transition :css="false" @before-enter="beforeEnter" @enter="enter" @leave="leave">
					<div v-if="importOpened" class="nooverflow clearfix">
						<div class="rp-import">
							<div class="form-group">
								<textarea class="form-control" v-model="importText" rows="20" placeholder="Paste JSON data here"></textarea>
							</div>
							<Alert :data="importAlert" />
							<div class="text-right">
								<button class="btn btn-primary" @click="importJson">Import Project JSON</button>
							</div>
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>

import {mapActions} from "vuex";
import Velocity from "velocity-animate";

export default {
	name: "ProjectManager",
	data: function() {
		return {
			importOpened: false,
			importText: "",
			importAlert: undefined
		}
	},
	methods: {
		...mapActions("project",{
			"openNewProject": "openNewProject"
		}),
		importJson: function() {
			try {
				this.importAlert = undefined;
				if (!this.importText || this.importText.length==0) throw {message:"JSON data is empty."};
				const data = JSON.parse(this.importText);

				console.log("data",data);

				this.$store.dispatch("project/loadProject",data.project).then(result => {
					this.$bus.$emit("success",result.msg);
					this.$store.dispatch("viewport/set",data.viewport);
				}).catch(result => {
					this.$bus.$emit("error",result.msg);
					this.importAlert = {type:"error",message:result.msg};
				});
			}
			catch(e) {
				this.importAlert = {type:"error",message:e.message};
			}
		},
		switchImport: function() {
			this.importOpened = !this.importOpened;
		},
		beforeEnter: function(el) {
			el.style.opacity = 0;
			el.style.height = 0;
		},
		enter: function(el,done) {
			Velocity(el,{opacity:1,height:$(el).find(".rp-import").outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		leave: function(el,done) {
			Velocity(el,{opacity:0,height:0},{duration:300,complete:done});
		}
	}
}

</script>