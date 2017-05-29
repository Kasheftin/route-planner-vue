import config from "../config";

const state = {
	initialized: false,
	data: undefined
}

const getters = {
}

const actions = {
	create: function({commit}) {
		commit("setProject",config.newProject);
	},
	close: function({commit}) {
		commit("setProject");
	}
}

const mutations = {
	setProject: function(state,data) {
		state.data = data;
		state.initialized = !!data;
	},
	updateInfo: function(state,data) {
		state.data.name = data.name;
		state.data.description = data.description;
	}
}

export default {
	state,
	getters,
	mutations,
	actions,
	namespaced: true
}