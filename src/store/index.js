import Vue from "vue";
import Vuex from "vuex";
import project from "./project";
import viewport from "./viewport";
import search from "./search";
import tool from "./tool";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

const STORAGE_KEY = "rp-projects";
const initialData = _.extend([],JSON.parse(window.localStorage.getItem(STORAGE_KEY))||[]);

const state = {
	projects: initialData
}

const saveState = function() {
	window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state.projects));
}

const actions = {
	addProject: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data.id) return reject({msg:"Project ID is not specified."});
			commit("addProject",data);
			return resolve({msg:"Project added"});
		});
	},
	removeProject: function({commit},data) {
		return new Promise((resolve,reject) => {
			commit("removeProject",data);
			return resolve({msg:"Project link removed from browser cache"});
		});
	},
	ensureProjectInProjectList: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data || !data.id) return resolve("Project is not specified");
			commit("ensureProjectInProjectList",data);
			return resolve("Project list contains the current project's data");
		});
	}
}

const mutations = {
	addProject: function(state,data) {
		state.projects.push(_.pick(data,"id","privateId","name"));
		saveState();
	},
	removeProject: function(state,data) {
		const i = _.findIndex(state.projects,p => p.id==data.id);
		if (i===0||i>0) {
			state.projects.splice(i,1);
		}
		saveState();
	},
	ensureProjectInProjectList: function(state,data) {
		const i = _.findIndex(state.projects,p => p.id==data.id);
		if (i===0||i>0) {
			_.extend(state.projects[i],_.pick(data,"id","privateId","name"));
		}
		else {
			state.projects.push(_.pick(data,"id","privateId","name"));
		}
		saveState();
	}
}

export default new Vuex.Store({
	state,
	actions,
	mutations,
	modules: {
		project,
		viewport,
		search,
		tool
	},
	strict: debug
});