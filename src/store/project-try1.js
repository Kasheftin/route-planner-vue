import { ObjectID } from "bson";
import Vue from "vue";
import config from "../config";

const state = {
	id: undefined,
	name: "",
	description: "",
	layersIds: [],
	layers: {},
	shapes: {}
}

const getters = {
	layers: (state,getters) => {
		return state.layersIds.map(layerId => state.layers[layerId]);
	},
	layerShapes: (state,getters) => (layerId) => {
		const layer = state.layers[layerId];
		if (!layer || !layer.shapesIds || layer.shapesIds.length==0) return [];
		return layer.shapesIds.map(shapeId => state.shapes[shapeId]);
	}
}

const actions = {
	openNewProject: function({commit}) {
		return new Promise((resolve,reject) => {
			const data = {
				id: (new ObjectID).toString(),
				name: "Untitled map",
				description: "This is sample description",
				layersIds: [],
				layers: {},
				shapes: {}
			};
			const layer1 = {
				id: (new ObjectID).toString(),
				name: "Untitled layer",
				visible: true,
				expanded: true,
				shapesIds: []
			};
			const layer2 = {
				id: (new ObjectID).toString(),
				name: "Layer 2",
				visible: true,
				expanded: true,
				shapesIds: []
			};
			data.layersIds.push(layer1.id,layer2.id);
			data.layers[layer1.id] = _.omit(layer1,"id");
			data.layers[layer2.id] = _.omit(layer2,"id");
			commit("setupProject",data);
			resolve({msg:"New project "+data.name+" initialized."});
		});
	},
	loadProject: function({commit},data) {
		return new Promise((resolve,reject) => {
			commit("setupProject",data);
			resolve({msg:"Project "+data.name+" opened."});
		});
	},
	closeProject: function({commit}) {
		return new Promise((resolve,reject) => {
			const data = {
				id: undefined,
				name: "",
				description: "",
				layersIds: [],
				layers: {},
				shapes: {}
			};
			commit("setupProject",data);
			resolve({msg:"Project closed."});
		})
	},
	addLayer: function({commit}) {
		return new Promise((resolve,reject) => {
			const data = {
				id: (new ObjectID).toString(),
				name: "Untitled layer",
				visible: true,
				expanded: true,
				shapesIds: []
			}
			commit("addLayer",data);
			resolve({msg:"New layer created.",id:data.id,layer:state.layers[data.id]});
		});
	},
	switchLayerExpanded: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = this.state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			if (!data.hasOwnProperty("expanded")) data.expanded = !l.expanded;
			commit("setLayerData",{layer:l,expanded:data.expanded});
			resolve({msg:"Layer "+(data.expanded?"expanded":"collapsed")+"."});
		});
	},
	switchLayerVisible: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = this.state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			if (!data.hasOwnProperty("visible")) data.visible = !l.visible;
			commit("setLayerData",{layer:l,visible:data.visible});
			resolve({msg:"Layer "+(data.visible?"is visible now.":"is invisible now.")});
		});
	},
	setLayerData: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = this.state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			if (data.hasOwnProperty("name") && !data.name) return reject("Layer name can not be empty.");
			data.layer = l;
			commit("setLayerData",data);
			resolve({msg:"Layer data updated."});
		});
	},
	switchLayers: function({commit},data) {
		return new Promise((resolve,reject) => {
			commit("switchLayers",_.pick(data,"newIndex","oldIndex"));
			resolve({msg:"Layers switched."});
		});
	},
	moveLayer: function({commit},e) {
		return new Promise((resolve,reject) => {
			commit("moveLayer",_.pick(e,"newIndex","oldIndex"));
			resolve({msg:"Layer moved."});
		});
	},
	removeLayer: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			commit("removeLayer",data);
			resolve({msg:"Layer deleted."});
		});
	},
	addShape: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.layerId];
			if (!l) return reject({msg:"Layer #"+data.layerId+" does not exist."});
			const shape = prepareShapeData(data.type,data.data);
			shape.layerId = data.layerId;
			commit("addShapeToLayer",{layer:l,shape:shape});
			resolve({msg:"New shape created.",id:shape.id,shape:shape,layer:layer});
		});
	},
	removeShape: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.layerId];
			if (!l) return reject({msg:"Layer #"+data.layerId+" does not exist."});
			commit("removeShapeFromLayer",{layer:l,shape:data});
			resolve({msg:"Shape removed."});
		});
	},
	setShapeData: function(state,data) {
		return new Promise((resolve,reject) => {
			const s = state.shapes[data.id];
			if (!s) return reject({msg:"Shape #"+data.id+" does not exist."});
			data.shape = s;
			commit("setShapeData",data);
			resolve({msg:"Shape data updated."});
		});
	},
	moveShape: function({commit},e) {
		return new Promise((resolve,reject) => {
			const layerFrom = state.layers[e.from.dataset.layerId];
			const layerTo = state.layers[e.to.dataset.layerId];
			if (!layerFrom) return reject("Failed to determine the layer shape should be moved from.");
			if (!layerTo) return reject("Failed to determine the layer shape should be moved to.");
			commit("moveShape",{layerFrom,layerTo,oldIndex:e.oldIndex,newIndex:e.newIndex});
			resolve({msg:"Shape moved."});
		});
	}
}

const mutations = {
	setupProject: function(state,data) {
		_.each(state,(v,k) => {
			if (data.hasOwnProperty(k)) {
				Vue.set(state,k,data[k]);
			}
		});
	},
	addLayer: function(state,data) {
		Vue.set(state.layers,data.id,_.omit(data,"id"));
		state.layersIds.unshift(data.id);
	},
	setLayerData: function(state,data) {
		_.each(data.layer,(v,k) => {
			if (data.hasOwnProperty(k)) {
				Vue.set(data.layer,k,data[k]);
			}
		});
	},
	switchLayers: function(state,e) {
		if (e.oldIndex===e.newIndex) return;
		const a = state.layersIds;
		const min = Math.min(e.oldIndex,e.newIndex);
		const max = Math.max(e.oldIndex,e.newIndex);
		Vue.set(state,"layersIds",Array.concat.call(Array,a.slice(0,min),[a[max]],a.slice(min+1,max),[a[min]],a.slice(max+1)));
	},
	moveLayer: function(state,e) {
		if (e.oldIndex==e.newIndex) return;
		state.layersIds.splice(e.newIndex,0,state.layersIds.splice(e.oldIndex,1)[0]);
	},
	removeLayer: function(state,data) {
		const index = state.layersIds.indexOf(data.id);
		if (index===0||index>0) {
			state.layersIds.splice(index,1);
		}
		Vue.delete(state.layers,data.id);
	},
	addShapeToLayer: function(state,data) {
		Vue.set(state.shapes,data.id,_.omit(data.shape,"id"));
		data.layer.shapesIds.unshift(data.shape.id);
	},
	removeShapeFromLayer: function(state,data) {
		const index = data.layer.shapesIds.indexOf(data.shape.id);
		if (index===0||index>0) {
			state.layer.shapesIds.splice(index,1);
		}
		Vue.delete(state.shapes,data.shape.id);
	},
	setShapeData: function(state,data) {
		_.each(data.shape,(v,k) => {
			if (data.hasOwnProperty(k)) {
				Vue.set(data.shape,k,data[k]);
			}
		});
	},
	moveShape: function(state,e) {
		e.layerTo.shapesIds.splice(e.newIndex,0,e.layerFrom.shapesIds.splice(e.oldIndex,1)[0]);
	}
}

const prepareShapeData = function(type,data) {
	if (data && data.type) type = data.type;
	if (type=="marker") {
		return prepareMarkerData(data);
	}
	else if (type=="dot") {
		return prepareDotData(data);
	}
	else if (type=="route") {
		return prepareRouteData(data);
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
	const out = _.extend(true,{
		id: (new ObjectID).toString(),
		type: "dot",
		name: "",
		text: "",
		geocode: {
			loading: false,
			status: 0,
			data: ""
		}
	},config.dot,data);
	if (data.latLng) {
		out.position = {lat:data.latLng.lat(),lng:data.latLng.lng()};
	}
	return _.pick(out,"id","type","name","text","position","icon","geocode");
}

const prepareRouteData = function(data) {
	const out = _.extend(true,{
		id: (new ObjectID).toString(),
		type: "route",
		name: "",
		distance: 0,
		duration: 0,
		mode: "auto",
		nohighways: false,
		notolls: false,
		waypoints: [],
		editing: false
	},config.route,data);
	return _.pick(out,"id","type","name","distance","duration","mode","nohighways","notolls","waypoints","editing");
}

export default {
	state,
	getters,
	mutations,
	actions,
	namespaced: true
}
