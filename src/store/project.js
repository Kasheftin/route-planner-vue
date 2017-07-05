import { ObjectID } from "bson";
import Vue from "vue";
import config from "../config";

const state = {
	id: undefined,
	privateId: undefined,
	name: "",
	description: "",
	layersIds: [],
	layers: {},
	shapes: {}
}

const getRandomId = function() {
	return (new ObjectID((new Date).getTime()+Math.floor(Math.random()*1234567890))).toString();
}

const getters = {
	layers: (state,getters) => {
		return state.layersIds.map(layerId => state.layers[layerId]);
	},
	layerShapes: (state,getters) => (layerId) => {
		const layer = state.layers[layerId];
		if (!layer || !layer.shapesIds || layer.shapesIds.length==0) return [];
		return layer.shapesIds.map(shapeId => state.shapes[shapeId]);
	},
	visibleRoutesIs: (state,getters) => {
		const ids = {};
		_.each(state.layers,l => {
			if (l.visible) {
				l.shapesIds.forEach(s => {
					if (state.shapes[s] && state.shapes[s].type=="route") {
						ids[s] = true;
					}
				});
			}
		});
		return ids;
	},
	export: (state,getters) => {
		const out = {
			id: state.id,
			privateId: state.privateId,
			name: state.name,
			description: state.description,
			layers: []
		};
		state.layersIds.forEach(id => {
			const layer = $.extend(true,{},state.layers[id]);
			layer.shapes = [];
			layer.shapesIds.forEach(id => {
				const shape = $.extend(true,{},state.shapes[id]);
				delete shape.editing;
				delete shape.loading;
				delete shape.layerId;
				delete shape.distance;
				delete shape.duration;
				delete shape.area;
				if (shape.geocode) {
					delete shape.geocode.loading;
				}
				layer.shapes.push(shape);
			});
			delete layer.shapesIds;
			out.layers.push(layer);

		});
		return out;
	}
}

const actions = {
	openNewProject: function({commit}) {
		return new Promise((resolve,reject) => {
			const data = {
				id: getRandomId(),
				privateId: getRandomId(),
				name: "Untitled map",
				description: "This is sample description",
				layersIds: [],
				layers: {},
				shapes: {}
			};
			const layer1 = {
				id: getRandomId(),
				name: "Untitled layer",
				visible: true,
				expanded: true,
				shapesIds: []
			};
			const layer2 = {
				id: getRandomId(),
				name: "Layer 2",
				visible: true,
				expanded: true,
				shapesIds: []
			};
			data.layersIds.push(layer1.id,layer2.id);
			data.layers[layer1.id] = layer1;
			data.layers[layer2.id] = layer2;
			commit("setupProject",data);
			resolve({msg:"New project "+data.name+" initialized."});
		});
	},
	loadProject: function({commit},data) {
		return new Promise((resolve,reject) => {
			if (!data) return reject({msg:"Project data not found."});
			const out = _.extend({
				id: getRandomId(),
				privateId: getRandomId(),
				name: "Untitled map",
				description: "This is sample description",
				layersIds: [],
				layers: {},
				shapes: {}
			},_.pick(data,"id","privateId","name","description"));
			(data.layers||[]).forEach(l => {
				const layer = _.extend({
					id: getRandomId(),
					name: "Untitled layer",
					visible: true,
					expanded: true,
					shapesIds: []
				},_.pick(l,"id","name","visible","expanded"));
				(l.shapes||[]).forEach(s => {
					const shape = prepareShapeData(s.type,s);
					shape.layerId = layer.id;
					out.shapes[shape.id] = shape;
					layer.shapesIds.push(shape.id);
				});
				out.layers[layer.id] = layer;
				out.layersIds.push(layer.id);
			});
			commit("setupProject",out);
			resolve({msg:"Project "+data.name+" opened."});
		});
	},
	cloneProject: function({commit}) {
		return new Promise((resolve,reject) => {
			commit("setupProject",{
				id: getRandomId(),
				privateId: getRandomId()			});
			resolve({msg:"Project has been cloned."});
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
	setProjectData: function({commit},data) {
		return new Promise((resolve,reject) => {
			commit("setProjectData",data);
			resolve({msg:"Project data updated."});
		});
	},
	addLayer: function({commit}) {
		return new Promise((resolve,reject) => {
			const data = {
				id: getRandomId(),
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
			const l = state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			if (!data.hasOwnProperty("expanded")) data.expanded = !l.expanded;
			commit("setLayerData",{layer:l,expanded:data.expanded});
			resolve({msg:"Layer "+(data.expanded?"expanded":"collapsed")+"."});
		});
	},
	switchLayerVisible: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.id];
			if (!l) return reject({msg:"Layer #"+data.id+" does not exist."});
			if (!data.hasOwnProperty("visible")) data.visible = !l.visible;
			commit("setLayerData",{layer:l,visible:data.visible});
			resolve({msg:"Layer "+(data.visible?"is visible now.":"is invisible now.")});
		});
	},
	setLayerData: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.id];
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
			resolve({msg:"Layer deleted.",id:data.id});
		});
	},
	addShape: function({commit},data) {
		return new Promise((resolve,reject) => {
			const l = state.layers[data.layerId];
			if (!l) return reject({msg:"Layer #"+data.layerId+" does not exist."});
			const s = prepareShapeData(data.type,data.data);
			s.layerId = data.layerId;
			commit("addShapeToLayer",{layer:l,shape:s});
			resolve({msg:"New shape created.",id:s.id,shape:s,layer:l});
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
	setShapeData: function({commit},data) {
		return new Promise((resolve,reject) => {
			const s = state.shapes[data.id];
			if (!s) return reject({msg:"Shape #"+data.id+" does not exist.1"});
			data.shape = s;
			commit("setShapeData",data);
			resolve({msg:"Shape data updated."});
		});
	},
	moveShapeWaypoint: function({commit},data) {
		return new Promise((resolve,reject) => {
			const s = state.shapes[data.id];
			if (!s) return reject({msg:"Shape #"+data.id+" does not exist."});
			data.shape = s;
			commit("moveShapeWaypoint",data);
			resolve({msg:"Shape waypoints resorted."});
		});
	},
	setShapeGeocodeData: function({commit},data) {
		return new Promise((resolve,reject) => {
			const s = state.shapes[data.id];
			if (!s) return reject({msg:"Shape #"+data.id+" does not exist."});
			commit("setShapeGeocodeData",{shape:s,geocode:data});
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
	setProjectData: function(state,data) {
		_.each(state,(v,k) => {
			if (k!="id" && data.hasOwnProperty(k)) {
				Vue.set(state,k,data[k]);
			}
		});
	},
	addLayer: function(state,data) {
		Vue.set(state.layers,data.id,data);
		state.layersIds.unshift(data.id);
	},
	setLayerData: function(state,data) {
		_.each(data.layer,(v,k) => {
			if (k!="id" && data.hasOwnProperty(k)) {
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
		Vue.set(state.shapes,data.shape.id,data.shape);
		data.layer.shapesIds.unshift(data.shape.id);
	},
	removeShapeFromLayer: function(state,data) {
		const index = data.layer.shapesIds.indexOf(data.shape.id);
		if (index===0||index>0) {
			data.layer.shapesIds.splice(index,1);
		}
		Vue.delete(state.shapes,data.shape.id);
	},
	setShapeData: function(state,data) {
		_.each(data.shape,(v,k) => {
			if (k!="id" && data.hasOwnProperty(k)) {
				Vue.set(data.shape,k,data[k]);
			}
		});
	},
	moveShapeWaypoint: function(state,e) {
		if (e.oldIndex==e.newIndex) return;
		e.shape.waypoints.splice(e.newIndex,0,e.shape.waypoints.splice(e.oldIndex,1)[0]);
	},
	setShapeGeocodeData: function(state,data) {
		_.each(data.shape.geocode,(v,k) => {
			if (data.geocode.hasOwnProperty(k)) {
				Vue.set(data.shape.geocode,k,data.geocode[k]);
			}
		});
	},
	moveShape: function(state,e) {
		e.layerTo.shapesIds.splice(e.newIndex,0,e.layerFrom.shapesIds.splice(e.oldIndex,1)[0]);
		const shapeId = e.layerTo.shapesIds[e.newIndex];
		if (shapeId && state.shapes[shapeId]) {
			Vue.set(state.shapes[shapeId],"layerId",e.layerTo.id);
		}
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
	else if (type=="polygon") {
		return preparePolygonData(data);
	}
}

const prepareMarkerData = function(data) {
	const out = _.extend({
		id: getRandomId(),
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
		if (p.hasOwnProperty("getUrl")) {
			out.photos.push({
				thumb: p.getUrl({maxHeight:240,maxWidth:360}),
				big: p.getUrl({maxHeight:1200,maxWidth:1600})
			});
		}
		else if (p.thumb && p.big) {
			out.photos.push(_.pick(p,"thumb","big"));
		}
	});
	console.log("prepareMarkerData",data,out);
	return _.pick(out,"id","type","name","formatted_address","international_phone_number","icon","types","url","note","position","placeId","photos");
}

const prepareDotData = function(data) {
	const out = $.extend(true,{
		id: getRandomId(),
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
		id: getRandomId(),
		type: "route",
		name: "",
		distance: 0,
		duration: 0,
		mode: "driving",
		nohighways: false,
		notolls: false,
		waypoints: ["",""],
		editing: false,
		loading: false
	},config.route,data);
	return _.pick(out,"id","type","name","distance","duration","mode","nohighways","notolls","waypoints","editing","loading");
}

const preparePolygonData = function(data) {
	const out = _.extend(true,{
		id: getRandomId(),
		type: "polygon",
		name: "",
		text: "",
		color: "",
		path: [],
		area: 0
	},config.polygon,data);
	return _.pick(out,"id","type","name","text","color","path","area");
}

export default {
	state,
	getters,
	mutations,
	actions,
	namespaced: true
}
