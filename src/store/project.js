import { ObjectID } from "bson";
import Vue from "vue";
import config from "../config";

const state = {
	initialized: false,
	data: undefined
}

const prepareProjectData = function(data) {
	const out = _.extend({
		id: (new ObjectID).toString(),
		name: "",
		description: "",
		layers: []
	},data);
	out.layers = _.map(out.layers,prepareLayerData);
	return _.pick(out,"id","name","description","layers");
}

const prepareLayerData = function(data) {
	const out = _.extend({
		id: (new ObjectID).toString(),
		name: "Untitled layer",
		expanded: false,
		visible: true,
		shapes: []
	},data);
	return _.pick(out,"id","name","expanded","visible","shapes");
}

const prepareShapeData = function(type,data) {
	if (data && data.type) type = data.type;
	if (type=="marker") {
		return prepareMarkerData(data);
	}
	else if (type=="dot") {
		return prepareDotData(data);
	}
}

const prepareMarkerData = function(data) {
	const out = _.extend({
		id: (new ObjectID).toString(),
		type: "marker",
		name: "",
		formatted_address: "",
		international_phone_number: "",
		icon: "",
		types: [],
		url: "",
		note: ""
	},data);
	if (data.geometry && data.geometry.location) {
		out.position = {lat:data.geometry.location.lat(),lng:data.geometry.location.lng()};
	}
	out.placeId = data.place_id;
	out.photos = [];
	(data.photos||[]).forEach((p) => {
		out.photos.push({
			thumb: p.getUrl({maxHeight:240,maxWidth:360}),
			big: p.getUrl({maxHeight:1200,maxWidth:1600})
		});
	});
	return _.pick(out,"id","type","name","formatted_address","international_phone_number","icon","types","url","note","position","placeId","photos");
}

const prepareDotData = function(data) {
	const out = _.extend({
		id: (new ObjectID).toString(),
		type: "dot",
		name: "",
		text: ""
	},data);
	if (data.latLng) {
		out.position = {lat:data.latLng.lat(),lng:data.latLng.lng()};
	}
	return _.pick(out,"id","type","name","text","position");
}

const actions = {
	create: function({commit}) {
		commit("setProject",prepareProjectData(config.newProject));
	},
	close: function({commit}) {
		commit("closeProject");
	},
	switchLayerExpand: function({commit},data) {
		const l = _.find(state.data.layers,{id:data.id});
		if (l) {
			commit("setLayerExpanded",{layer:l,expanded:!l.expanded});
		}
	},
	contractLayer: function({commit},data) {
		const l = _.find(state.data.layers,{id:data.id});
		if (l) {
			commit("setLayerExpanded",{layer:l,expanded:false});
		}
	},
	switchLayerVisibility: function({commit},data) {
		const l = _.find(state.data.layers,{id:data.id});
		if (l) {
			commit("setLayerVisibility",{layer:l,visible:!l.visible});
		}
	},
	resortLayers: function({commit},e) {
		commit("resortLayers",_.pick(e,"newIndex","oldIndex"));
	},
	moveLayer: function({commit},e) {
		commit("moveLayer",_.pick(e,"newIndex","oldIndex"));
	},
	addLayerPromise: function({commit},data) {
		return new Promise((resolve,reject) => {
			const newLayer = prepareLayerData(data);
			commit("appendLayer",newLayer);
			resolve(newLayer);
		});
	},
	updateLayerInfoPromise: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data.id) return reject("Layer id is not specified.");
			const l = _.find(state.data.layers,{id:data.id});
			if (!l) return reject("Specified layer does not exist.");
			if (!data.name || data.name.length==0) return reject("Layer name can not be empty.");
			commit("updateLayerInfo",{layer:l,name:data.name,visible:data.visible});
			resolve("Layer info has been updated.");
		});
	},
	removeLayerPromise: function({commit},id) {
		return new Promise((resolve,reject) => {
			const index = _.findIndex(state.data.layers,{id:id});
			if (index===0||index>0) {
				commit("removeLayerByIndex",index);
				resolve("Layer has been deleted.");
			}
			else reject("Layer not found.");
		});
	},
	addShapePromise: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data.layerId) return reject("Please select the layer you want to add shape to.");
			const l = _.find(state.data.layers,{id:data.layerId});
			if (!l) return reject("Failed adding new shape, specified layer does not exist.");
			const shape = prepareShapeData(data.type,data.data);
			commit("addShape",{layer:l,shape:shape});
			return resolve("Shape has been added to the project.",shape);
		});
	},
	removeShapePromise: function({commit},id) {
		return new Promise((resolve,reject) => {
			let cnt = 0;
			state.data.layers.forEach((l) => {
				let index = _.findIndex(l.shapes,{id:id});
				if (index===0||index>0) {
					commit("removeShapeFromLayerByIndex",{layer:l,index:index});
					cnt++;
				}
			});
			if (cnt==1) return resolve("Shape has been deleted.");
			else if (cnt>1) return resolve("Shape removed with doubles.");
			else reject("Shape not found.");
		});
	},
	updateShapeNotePromise: function({commit},data) {
		return new Promise((resolve,reject) => {
			let cnt = 0;
			console.log("here1");
			state.data.layers.forEach((l) => {
				console.log("here",l);
				let s = _.find(l.shapes,{id:data.id});
				if (s) {
					commit("updateShapeNote",{shape:s,note:data.note});
					cnt++;
				}
			});
			console.log("updateShapeNotePromise",data,cnt);
			if (cnt==1) return resolve("Shape note has been updated.");
			else if (cnt>1) return resolve("Shape note has been updated, but incorrect shape doubles found in different layers.");
			else reject("Shape not found.");
		});
	},
	moveShape: function({commit},e) {
		const layerFrom = _.find(state.data.layers,{id:e.from.dataset.layerId});
		const layerTo = _.find(state.data.layers,{id:e.to.dataset.layerId});
		if (layerFrom && layerTo) {
			commit("moveShape",{layerFrom:layerFrom,layerTo:layerTo,fromIndex:e.fromIndex,toIndex:e.toIndex});
		}
	}
}

const mutations = {
	setProject: function(state,data) {
		Vue.set(state,"data",data);
		Vue.set(state,"initialized",true);
	},
	closeProject: function(state) {
		Vue.set(state,"data",undefined);
		Vue.set(state,"initialized",false);
	},
	setLayerExpanded: function(state,data) {
		Vue.set(data.layer,"expanded",data.expanded);
	},
	setLayerVisibility: function(state,data) {
		Vue.set(data.layer,"visible",data.visible);
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
	updateLayerInfo: function(state,data) {
		Vue.set(data.layer,"name",data.name);
		Vue.set(data.layer,"visible",data.visible);
	},
	removeLayerByIndex: function(state,index) {
		state.data.layers.splice(index,1);
	},
	addShape: function(state,data) {
		data.layer.shapes.push(data.shape);
	},
	removeShapeFromLayerByIndex: function(state,data) {
		data.layer.shapes.splice(data.index,1);
	},
	updateShapeNote: function(state,data) {
		Vue.set(data.shape,"note",data.note);
	},
	moveShape: function(state,e) {
		e.layerTo.shapes.splice(e.newIndex,0,e.layerFrom.shapes.splice(e.oldIndex,1)[0]);
	}
}

export default {
	state,
	mutations,
	actions,
	namespaced: true
}