import Vue from "vue";
import Vuex from "vuex";
import project from "./project";
import viewport from "./viewport";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		project,
		viewport
	},
	strict: debug
});