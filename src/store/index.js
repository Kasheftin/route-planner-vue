import Vue from "vue";
import Vuex from "vuex";
import project from "./project-try2";
import viewport from "./viewport";
import search from "./search";
import tool from "./tool";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		project,
		viewport,
		search,
		tool
	},
	strict: debug
});