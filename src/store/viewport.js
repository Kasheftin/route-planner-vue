import Vue from "vue";
import config from "../config";

const STORAGE_KEY = "rp-viewport";
const initialData = _.extend(config.viewport,JSON.parse(window.localStorage.getItem(STORAGE_KEY))||{});

const state = {
	center: {
		lat: initialData.lat,
		lng: initialData.lng
	},
	zoom: initialData.zoom,
	mapTypeId: initialData.mapTypeId
}

const getters = {
	viewport: state => {
		return {
			lat: state.center.lat,
			lng: state.center.lng,
			zoom: state.zoom,
			mapTypeId: state.mapTypeId
		}
	}
}

const saveState = _.debounce((state) => {
	window.localStorage.setItem(STORAGE_KEY,JSON.stringify(getters.viewport(state)));
},1000);

const actions = {
	update: function({commit},data) {
		commit("update",data);
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
	}
}

export default {
	state,
	getters,
	actions,
	mutations,
	namespaced: true
}