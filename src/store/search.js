import Vue from "vue";

const state = {
	results: []
}

const prepareResults = function(results) {
	const data = [];
	results.forEach((r) => {
		if (!r.geometry) return;
		const photos = [];
		(r.photos||[]).slice(0,2).forEach((p) => {
			photos.push(p.getUrl({maxHeight:120,maxWidth:160}));
		});
		data.push({
			address: r.formatted_address,
			name: r.name,
			position: {
				lat: r.geometry.location.lat(),
				lng: r.geometry.location.lng()
			},
			icon: r.icon,
			_id: r.id,
			reference: r.reference,
			types: r.types,
			photos: photos
		});
	});
	return data;
}

const actions = {
	setResults: function({commit},results) {
		console.log("searchresults",results,prepareResults(results));
		commit("setResults",prepareResults(results));
	},
	appendResults: function({commit},results) {
		commit("appendResults",prepareResults(results));
	}
}

const mutations = {
	setResults: function(state,results) {
		state.results = results||[];
	},
	appendResults: function(state,results) {
		if (!results || results.length==0) return;
		if (state.results.length==0) {
			state.results = results;
			return;
		}
		const map = {};
		state.results.forEach((r) => {
			map[r._id] = true;
		});
		results.forEach((r) => {
			if (!map[r._id]) {
				state.results.push(r);
				map[r._id] = true;
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