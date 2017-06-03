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
		commit("closeProject");
	},
	updateInfo: function({commit},data) {
		return new Promise((resolve,reject) => {
			commit("updateInfo",data);
			resolve("Project info has been updated.");
		});
	},
	switchLayerExpand: function({commit},data) {
		commit("switchLayerExpand",data);
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
	},
	updateLayerInfo: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data.id) return reject("Layer id is not specified.");
			const l = _.find(state.data.layers,{id:data.id});
			if (!l) return reject("Specified layer does not exist.");
			if (!data.name || data.name.length==0) return reject("Layer name can not be empty.");
			commit("editLayer",{layer:l,data:data});
			resolve("Layer info has been updated.");
		});
	},
	removeLayer: function({commit},id) {
		return new Promise((resolve,reject) => {
			commit("removeLayer",id);
			resolve("Layer has been deleted.");
		});
	},
	addShape: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data.layerId) return reject("Please select the layer you want to add place to.");
			const l = _.find(state.data.layers,{id:data.layerId});
			if (!l) return reject("Failed adding new place, specified layer does not exist.");
			commit("addShape",data);
			return resolve("Place has been added to the project.");
		});
	},
	removeShape: function({commit},id) {
		commit("removeShape",id);
	},
	moveShape: function({commit},e) {
		commit("moveShape",e);
	},
	updateShapeNote: function({commit},data) {
		commit("updateShapeNote",data);
	}
}

const createNewLayer = function(data) {
	if (!data) data = {};
	if (!data.id) data.id = (new ObjectID).toString();
	data = _.extend({
		name: "Untitled layer",
		expanded: false,
		visible: true,
		shapes: []
	},data);
	return _.pick(data,"id","name","expanded","visible","shapes");
}

const prepareShapeData = function(data) {
	const out = _.pick(data,"name","formatted_address","international_phone_number","icon","types","url","note");
	if (!out.note) out.note = "";
	out.id = (new ObjectID).toString();
	out.position = {lat:data.geometry.location.lat(),lng:data.geometry.location.lng()};
	out.placeId = data.place_id;
	out.photos = [];
	(data.photos||[]).forEach((p) => {
		out.photos.push({
			thumb: p.getUrl({maxHeight:240,maxWidth:360}),
			big: p.getUrl({maxHeight:1200,maxWidth:1600})
		});
	});
	return out;
}

const mutations = {
	setProject: function(state,data) {
		if (!data) data = {};
		if (!data.id) data.id = (new ObjectID).toString();
		data = _.extend({
			name: "",
			description: "",
			layers: []
		},data);
		data = _.pick(data,"id","name","description","layers");
		data.layers = _.map(data.layers,createNewLayer);
		Vue.set(state,"data",data);
		Vue.set(state,"initialized",true);
	},
	closeProject: function(state) {
		Vue.set(state,"data",undefined);
		Vue.set(state,"initialized",false);
	},
	updateInfo: function(state,data) {
		Vue.set(state.data,"name",data.name);
		Vue.set(state.data,"description",data.description);
	},
	switchLayerExpand: function(state,data) {
		const l = _.find(state.data.layers,{id:data.id});
		if (l) {
			Vue.set(l,"expanded",!l.expanded);
		}
	},
	contractLayer: function(state,data) {
		const l = _.find(state.data.layers,{id:data.id});
		if (l) {
			Vue.set(l,"expanded",false);
		}
	},
	switchLayerVisibility: function(state,data) {
		const l = _.find(state.data.layers,{id:data.id});
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
	},
	editLayer: function(state,ar) {
		if (ar.layer) {
			ar.layer.name = ar.data.name;
			ar.layer.visible = ar.data.visible;
		}
	},
	removeLayer: function(state,id) {
		const i = _.findIndex(state.data.layers,{id:id});
		if (i===0||i>0) {
			state.data.layers.splice(i,1);
		}
	},
	addShape: function(state,data) {
		const l = _.find(state.data.layers,{id:data.layerId});
		if (l) {
			data = _.pick(data,"type","data");
			data.data = prepareShapeData(data.data);
			l.shapes.push(data);
		}
	},
	removeShape: function(state,id) {
		state.data.layers.forEach((l) => {
			let i = _.findIndex(l.shapes,s => s.data.id==id);
			if (i===0||i>0) l.shapes.splice(i,1);
		});
	},
	updateShapeNote: function(state,data) {
		state.data.layers.forEach((l) => {
			const s = _.find(l.shapes,s => s.data.id==data.id);
			console.log("updateShapeNote",s,data);
			if (s) {
				s.data.note = data.note;
			}
		});
	},
	moveShape: function(state,e) {
		const layerFrom = _.find(state.data.layers,{id:e.from.dataset.layerId});
		const layerTo = _.find(state.data.layers,{id:e.to.dataset.layerId});
		if (layerFrom && layerTo) {
			layerTo.shapes.splice(e.newIndex,0,layerFrom.shapes.splice(e.oldIndex,1)[0]);
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