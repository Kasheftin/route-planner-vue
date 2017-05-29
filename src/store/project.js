import { ObjectID } from "bson";
import Vue from "vue";
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
	},
	switchLayerExpand: function({commit},data) {
		const l = _.find(state.data.layers,{_id:data._id});
		if (l.visible) {
			commit("switchLayerExpand",data);
		}
	},
	contractLayer: function({commit},data) {
		commit("contractLayer",data);
	},
	switchLayerVisibility: function({commit},data) {
		commit("switchLayerVisibility",data);
	}
}

const mutations = {
	setProject: function(state,data) {
		if (!data._id) data._id = (new ObjectID).toString();
		data = _.extend({
			name: "",
			description: "",
			layers: []
		},data);
		data = _.pick(data,"_id","name","description","layers");
		data.layers = _.map(data.layers,l => {
			if (!l._id) l._id = (new ObjectID).toString();
			l = _.extend({
				name: "",
				expanded: false,
				visible: true
			},l);
			return _.pick(l,"_id","name","expanded","visible");
		});
		Vue.set(state,"data",data);
		Vue.set(state,"initialized",!!data);
	},
	updateInfo: function(state,data) {
		Vue.set(state.data,"name",data.name);
		Vue.set(state.data,"description",data.description);
	},
	switchLayerExpand: function(state,data) {
		const l = _.find(state.data.layers,{_id:data._id});
		if (l) {
			Vue.set(l,"expanded",!l.expanded);
		}
	},
	contractLayer: function(state,data) {
		const l = _.find(state.data.layers,{_id:data._id});
		if (l) {
			Vue.set(l,"expanded",false);
		}
	},
	switchLayerVisibility: function(state,data) {
		const l = _.find(state.data.layers,{_id:data._id});
		if (l) {
			Vue.set(l,"visible",!l.visible);
		}
	}
}

export default {
	state,
	getters,
	mutations,
	actions,
	namespaced: true
}