
const DEFAULT_TOOL = "hand";

const state = {
	name: DEFAULT_TOOL
}

const actions = {
	setTool: function({commit},name) {
		commit("setTool",name);
	}
}

const mutations = {
	setTool: function(state,name) {
		state.name = name||DEFAULT_TOOL;
	}
}

export default {
	state,
	actions,
	mutations,
	namespaced: true
}