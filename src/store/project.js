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
	},
	resortLayers: function({commit},e) {
		commit("resortLayers",e);
	},
	moveLayer: function({commit},e) {
		commit("moveLayer",e);
	},
	addLayer: function({commit},data) {
		return new Promise((resolve,reject) => {
			const newLayer = createNewLayer(data);
			commit("appendLayer",newLayer);
			resolve(newLayer);
		});
	}
}

const createNewLayer = function(data) {
	if (!data) data = {};
	if (!data._id) data._id = (new ObjectID).toString();
	data = _.extend({
		name: "Untitled layer",
		expanded: false,
		visible: true
	},data);
	return _.pick(data,"_id","name","expanded","visible");
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
		data.layers = _.map(data.layers,createNewLayer);
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
	},
	resortLayers: function(state,e) {
		if (e.oldIndex===e.newIndex) return;
		const a = state.data.layers;
		const min = Math.min(e.oldIndex,e.newIndex);
		const max = Math.max(e.oldIndex,e.newIndex);
		Vue.set(state.data,"layers",Array.concat.call(Array,a.slice(0,min),[a[max]],a.slice(min+1,max),[a[min]],a.slice(max+1)));
	},
	moveLayer: function(state,e) {
		state.data.layers.splice(e.newIndex,0,state.data.layers.splice(e.oldIndex,1)[0]);
	},
	appendLayer: function(state,data) {
		state.data.layers.unshift(data);
	}
}

export default {
	state,
	getters,
	mutations,
	actions,
	namespaced: true
}