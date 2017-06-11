import Vue from "vue";

const state = {
	results: []
}

const prepareResults = function(results) {
	const data = [];
	results.forEach((r) => {
		if (r.geometry && r.geometry.location) {
			data.push({
				id: r.place_id,
				location: {
					lat: r.geometry.location.lat(),
					lng: r.geometry.location.lng()
				},
				icon: r.icon
			});
		}
	});
	return data;
}

const actions = {
	setResults: function({commit},results) {
		commit("setResults",prepareResults(results));
	},
	appendResults: function({commit},results) {
		commit("appendResults",prepareResults(results));
	}
}

const mutations = {
	setResults: function(state,results) {
		Vue.set(state,"results",results);
	},
	appendResults: function(state,results) {
		const map = {};
		state.results.forEach((r) => {
			map[r.id] = true;
		});
		results.forEach((r) => {
			if (!map[r.id]) {
				state.results.push(r);
			}
		});
	}
}

export default {
	state,
	actions,
	mutations,
	namespaced: true
}