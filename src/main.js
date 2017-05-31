import Vue from "vue";
import * as VueGoogleMaps from "vue2-google-maps";

import "./vendors";
import "./stylesheets/main.scss";
import App from "./components/App.vue";
import PromisesBus from "./utils/PromisesBus";
import store from "./store";

Vue.use(VueGoogleMaps,{
	load: {
		key: "AIzaSyBg4OgaTYn02ZESKX2DuQ70wzORVCrsVRM",
		libraries: "places"
	}
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
