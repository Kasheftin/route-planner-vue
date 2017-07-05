<template>
	<div class="rp-modal-overlay">
		<div class="rp-modal">
			<div class="rp-modal-body pt0">
				<h1>Route Planner Vue v0.1</h1>
				<p class="lead">Simple free tool for planning routes</p>
				<p>This is the clone of my old original <a href="https://github.com/Kasheftin/RoutePlanner">Route Planner</a> that was written to deeply understand vue.js.</p>
				<p>
					It uses <a href="https://vuejs.org/">vue.js</a>, <a href="https://vuex.vuejs.org/">vuex</a>, <a href="https://github.com/xkjyeah/vue-google-maps">vue2-google-maps</a>, <a href="https://github.com/RubaXa/Sortable">sortablejs</a> and a couple of well known approaches like centralized event bus and centralized promise bus.
					Several utilities like webpack, fontello, velocity and bootstrap also are in use.
				</p>
				<p>
					There's also small optional php+mysql backend for storing the data.
				</p>
				<p>Github repo: <a href="https://github.com/Kasheftin/route-planner-vue">https://github.com/Kasheftin/route-planner-vue</a>.</p>
				<div class="rp-welcome-buttons">
					<button class="btn btn-default" @click="openNewProject">Create New Project</button>
					<button class="btn btn-default" @click="switchLoad">Load Project</button>
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
				<transition :css="false" @before-enter="beforeEnter" @enter="enter" @leave="leave">
					<div v-if="loadOpened" class="nooverflow clearfix">
						<div class="rp-load">
							<Alert :data="importAlert" />
							<h4>Project list</h4>
							<div class="alert alert-success" v-if="projects.length==0">Project Links not found in browser cache.</div>
							<table class="table table-bordered" v-if="projects.length>0">
								<tbody>
									<tr v-for="project in projects">
										<td>
											<div v-if="project.name"><a href="javascript:void(0)" @click="$bus.$emit('loadProject',project)">{{project.name}}</a></div>
											<div v-if="project.name">ID: {{project.id}}</div>
											<div v-else>ID: <a href="javascript:void(0)" @click="$bus.$emit('loadProject',project)">{{project.id}}</a></div>
											<div>Private key: <span v-if="project.privateId">{{project.privateId}}</span><span v-else>--viewonly--</span></div>
										</td>
										<td>
											<div><a :href="'/#id='+project.id+'&privateId='+project.privateId" target="_blank" v-if="project.privateId">Edit link</a></div>
											<div><a :href="'/#id='+project.id" target="_blank">View link</a></div>
										</td>
										<td>
											<div><a href="javascript:void(0)" @click="removeFromLocalStorage(project)">Remove from browser cache</a></div>
											<div><a href="javascript:void(0)" v-if="project.privateId" @click="deleteFromServer(project)">Delete from server</a></div>
										</td>
									</tr>
								</tbody>
							</table>
							<h4>Add project</h4>
							<Alert :data="newAlert" />
							<table class="table">
								<tbody>
									<tr>
										<td><input class="form-control" type="text" placeholder="Project ID" v-model="newId"></td>
										<td><input class="form-control" type="text" placeholder="Private key" v-model="newPrivateId"></td>
										<td>
											<button class="form-control btn btn-default" @click="tryAddProject" :disabled="newLoading">
												<span v-if="newLoading" class="icon-loading icon-spin"></span>
												<span v-else>Add Project</span>
											</button>
										</td>
									</tr>
								</tbody>
							</table>

						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>

import {mapActions,mapState} from "vuex";
import Velocity from "velocity-animate";

export default {
	name: "ProjectManager",
	data: function() {
		return {
			importOpened: false,
			loadOpened: false,
			importText: "",
			importAlert: undefined,
			newId: "",
			newPrivateId: "",
			newLoading: false,
			newAlert: undefined
		}
	},
	computed: {
		...mapState({
			projects: state => state.projects
		})
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
				this.$bus.$emit("openProject",data,(resultType,result) => {
					if (resultType=="error") {
						this.importAlert = {type:"error",message:result.msg};
					}
				});
			}
			catch(e) {
				this.importAlert = {type:"error",message:e.message};
			}
		},
		switchImport: function() {
			this.importOpened = !this.importOpened;
			this.loadOpened = false;
		},
		switchLoad: function() {
			this.loadOpened = !this.loadOpened;
			this.importOpened = false;
		},
		beforeEnter: function(el) {
			el.style.opacity = 0;
			el.style.height = 0;
		},
		enter: function(el,done) {
			Velocity(el,{opacity:1,height:$(el).find(".rp-import,.rp-load").outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		leave: function(el,done) {
			Velocity(el,{opacity:0,height:0},{duration:300,complete:done});
		},
		tryAddProject: function() {
			if (!this.newId) {
				this.newAlert = {type:"error",message:"Project ID is empty"};
				return;
			}
			this.newLoading = true;
			this.newAlert = undefined;
			this.$bus.$emit("makeRequest",{id:this.newId,privateId:this.newPrivateId},(resultType,result) => {
				if (resultType=="success") {
					this.$store.dispatch("addProject",result.data.project).then(result => {
						this.newId = "";
						this.newPrivateId = "";
						this.$bus.$emit("success",result);
					}).catch(result => {
						this.$bus.$emit("error",result);
						this.newAlert = {type:"error",message:result.msg};
					});
				}
				else {
					this.$bus.$emit("error",result.message);
					this.newAlert = {type:"error",message:result.message};
				}
				this.newLoading = false;
			});
		},
		removeFromLocalStorage: function(project) {
			this.$store.dispatch("removeProject",project).then(result => {
				this.$bus.$emit("success",result);
			}).catch(result => this.$bus.$emit("error",result));
		},
		deleteFromServer: function(project) {
			this.$bus.$emit("makeRequest",{id:project.id,privateId:project.privateId,action:"delete"},(resultType,result) => {
				if (resultType=="success") {
					this.$bus.$emit("success",result.message);
					this.$store.dispatch("removeProject",project);
				}
				else {
					this.$bus.$emit("error",result.message);
				}
			});
		},
	}
}

</script>