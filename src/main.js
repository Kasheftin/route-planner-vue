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
