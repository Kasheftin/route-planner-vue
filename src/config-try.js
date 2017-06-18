export default {
	viewport: {
		lat: 48.740,
		lng: 19.140,
		zoom: 13,
		mapTypeId: "roadmap"
	},
	newProject: {
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
	emptyProject: {
		id: undefined,
		name: "",
		description: "",
		layersIds: [],
		layers: {},
		shapes: {},
		selectedLayerId: undefined
	},
	emptyLayer: {
		id: undefined,
		name: "Untitled layer",
		expanded: false,
		visible: true,
		shapesIds: []
	},


	dot: {
		icon: "https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1",
		name: "Untitled marker"
	}
};