import Vue from "vue";
import config from "../config";

const STORAGE_KEY = "rp-viewport";
const initialData = _.extend(config.viewport,JSON.parse(window.localStorage.getItem(STORAGE_KEY))||{});


const state = {
	center: {
		lat: parseFloat(initialData.lat),
		lng: parseFloat(initialData.lng)
	},
	zoom: initialData.zoom,
	mapTypeId: initialData.mapTypeId
}

const getters = {
	viewport: state => {
		return {
			lat: state.center.lat.toFixed(6),
			lng: state.center.lng.toFixed(6),
			zoom: state.zoom,
			mapTypeId: state.mapTypeId
		}
	}
}

const saveState = _.debounce((state) => {
	console.log("set viewport",getters.viewport(state));
	window.localStorage.setItem(STORAGE_KEY,JSON.stringify(getters.viewport(state)));
},300);

const actions = {
	update: function({commit},data) {
		commit("update",data);
	},
	set: function({commit},data) {
		commit("set",data);
	}
}

const mutations = {
	update: function(state,{what,e}) {
		if (what == "center") {
			state.center.lat = e.lat();
			state.center.lng = e.lng();
		}
		else if (what == "zoom") {
			state.zoom = e;
		}
		else if (what == "mapTypeId") {
			state.mapTypeId = e;
		}
		saveState(state);
	},
	set: function(state,data) {
		state.center.lat = parseFloat(data.lat);
		state.center.lng = parseFloat(data.lng);
		state.zoom = data.zoom;
		state.mapTypeId = data.mapTypeId;
	}
}

export default {
	state,
	getters,
	actions,
	mutations,
	namespaced: true
}