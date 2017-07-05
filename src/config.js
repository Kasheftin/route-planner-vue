export default {
	api: {
		url: "https://route-planner.booger.ru/api"
	},
	viewport: {
		lat: 48.740,
		lng: 19.140,
		zoom: 14,
		mapTypeId: "roadmap"
	},
	project: {
		name: "Untitled map",
		description: "This is sample description",
		layers: [{
			name: "Untitled layer",
			isVisible: true,
			isExpanded: true,
			shapesIds: []
		},{
			name: "Layer 2",
			isVisible: true,
			isExpanded: true,
			shapesIds: []
		}]
	},
	dot: {
		icon: "https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1",
		name: "Untitled marker"
	},
	route: {
		waypoints: ["",""]
	},
	polygon: {
		name: "Untitled polygon",
		color: "#ff0000"
	},
	colors: ["#ff0000","#23c8c6","#ffffbf","#4fb7f9"]
};
