const state = {
	results: []
}

let resultsCache = {};

const getters = {
	results: function(state,getters) {
		return _.map(state.results,(id) => {
			return resultsCache[id];
		});
	}
}

const actions = {
	setResults: function({commit},results) {
		commit("setResults",results);
	},
	appendResults: function({commit},results) {
		commit("appendResults",results);
	}
}

const mutations = {
	setResults: function(state,results) {
		const ids = [];
		const cache = {};
		(results||[]).forEach((r) => {
			if (!cache[r.id]) {
				cache[r.id] = r;
				ids.push(r.id);
			}
		});
		state.results = ids;
		resultsCache = cache;
	},
	appendResults: function(state,results) {
		if (!results || results.length==0) return;
		(results||[]).forEach((r) => {
			if (!resultsCache[r.id]) {
				resultsCache[r.id] = r;
				state.results.push(r.id);
			}
		});
	}
}

export default {
	state,
	getters,
	actions,
	mutations,
	namespaced: true
}