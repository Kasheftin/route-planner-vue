<template>
	<div class="rp-container">
		<gmap-map
			:center="center"
			:zoom="zoom"
			:mapTypeId="mapTypeId"
			@zoom_changed="updateViewport({what:'zoom',e:$event})"
			@center_changed="updateViewport({what:'center',e:$event})"
			@maptypeid_changed="updateViewport({what:'mapTypeId',e:$event})"
			ref="map"
		></gmap-map>
		<transition name="rp-modal">
			<template v-if="projectInitialized">
				<ProjectSettings />
			</template>
			<template v-else>
				<ProjectManager />
			</template>
		</transition>
		<transition name="rp-modal">
			<component :is="modalWindowComponent" />
		</transition>
		<Toastr />
	</div>
</template>

<script>
import {mapState,mapActions,mapMutations} from "vuex";
import ProjectManager from "./ProjectManager.vue";
import ProjectSettings from "./ProjectSettings.vue";
import ProjectInfoEditor from "./ProjectInfoEditor.vue";
import Toastr from "./Toastr.vue";

export default {
	name: "App",
	data: function() {
		return {
			modalWindowComponent: undefined
		}
	},
	computed: {
		...mapState("viewport",{
			center: state => state.center,
			zoom: state => state.zoom,
			mapTypeId: state => state.mapTypeId
		}),
		...mapState("project",{
			projectInitialized: state => state.initialized
		})
	},
	methods: {
		...mapMutations({
			updateViewport: "viewport/update"
		})
	},
	created: function() {
		this._switchModal = (name,options) => {
			this.modalWindowComponent = (this.modalWindowComponent==name?undefined:name);
		}
		this._closeModal = () => {
			this.modalWindowComponent = undefined;
		}
		this.$bus.$on("switchModal",this._switchModal);
		this.$bus.$on("closeModal",this._closeModal);
	},
	destroyed: function() {
		this.$bus.$off("switchModal",this._switchModal);
		this.$bus.$off("closeModal",this._closeModal);
	},
	mounted: function() {
		navigator.geolocation && navigator.geolocation.getCurrentPosition(position => {
			this.data.center.lat = position.coords.latitude,
			this.data.center.lng = position.coords.longitude
		});
		this.$refs.map.$mapCreated.then(() => {
			this.$refs.map.$mapObject.setOptions({
				mapTypeControl: true,
				mapTypeControlOptions: {
					mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.TERRAIN],
					style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
					position: google.maps.ControlPosition.TOP_RIGHT
				},
				panControl: true,
				panControlOptions: {
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				streetViewControl: true,
				streetViewControlOptions: {
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				zoomControl: true,
				zoomControlOptions: {
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				scaleControl: true,
				overviewMapControl: true,
				rotateControl: true
			});
		});
	},
	components: {
		ProjectManager: ProjectManager,
		ProjectSettings: ProjectSettings,
		ProjectInfoEditor: ProjectInfoEditor,
		Toastr: Toastr
	}
}
</script>