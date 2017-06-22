import Vue from "vue";
import * as VueGoogleMaps from "vue2-google-maps";

import "./vendors";
import "./stylesheets/main.scss";
import "./stylesheets/icons/css/fontello-embedded.css";
import App from "./components/App.vue";
import PromisesBus from "./utils/PromisesBus";
import Draggable from "vuedraggable";
import store from "./store";

Vue.use(VueGoogleMaps,{
	load: {
		key: "AIzaSyBg4OgaTYn02ZESKX2DuQ70wzORVCrsVRM",
		libraries: "places"
	}
});

Vue.component("Draggable",Draggable);

Vue.filter("latlng",function(ar) {
	const lat = _.isFunction(ar.lat)?ar.lat():ar.lat;
	const lng = _.isFunction(ar.lng)?ar.lng():ar.lng;
	return lat.toFixed(6)+", "+lng.toFixed(6);
});

Vue.filter("commedArray",function(ar) {
	return (ar||[]).join(", ");
});

Vue.filter("duration",function(v) {
	const h = Math.floor(v/3600);
	const m = Math.floor((v-h*3600)/60);
	const s = v-h*3600-m*60;
	if (h==0 && m==0) return s+" sec";
	if (h==0) return m+" min";
	return h+" h "+m+" min";
});

Vue.filter("distance",function(v) {
	const km = Math.floor(v/1000);
	const m = v-km*1000;
	if (km==0) return v+" m";
	if (km<10) return km+" km "+m+" m";
	return km+" km.";
});

Object.defineProperty(Vue.prototype,"$bus",{
	get: function() {
		return this.$root.bus;
	}
});

Object.defineProperty(Vue.prototype,"$promises",{
	get: function() {
		return this.$root.promisesBus;
	}
});

new Vue({
	el: "#app",
	template: "<App />",
	data: {
		bus: new Vue({}),
		promisesBus: new PromisesBus()
	},
	store: store,
	components: {
		App: App
	},
});
