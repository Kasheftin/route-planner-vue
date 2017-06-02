<template>
	<div class="rp-container">
		<gmap-map
			:center="center"
			:zoom="zoom"
			:mapTypeId="mapTypeId"
			@zoom_changed="$store.dispatch('viewport/update',{what:'zoom',e:$event})"
			@center_changed="$store.dispatch('viewport/update',{what:'center',e:$event})"
			@maptypeid_changed="$store.dispatch('viewport/update',{what:'mapTypeId',e:$event})"
			ref="map"
		>
			<SearchResults />
			<SearchDetailedResult />
			<ProjectMarkers v-if="projectInitialized" />
			<ProjectMarkerInfo />
		</gmap-map>
		<transition name="rp-modal">
			<div v-if="projectInitialized">
				<Project />
				<SearchBox />
			</div>
		</transition>
		<transition name="rp-modal">
			<template v-if="!projectInitialized">
				<Manager />
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
import Manager from "./Manager.vue";
import Project from "./project/Main.vue";
import ProjectMarkers from "./project/Markers.vue";
import ProjectMarkerInfo from "./project/MarkerInfo.vue";
import ProjectInfoEditor from "./project/InfoEditor.vue";
import SearchBox from "./search/Box.vue";
import SearchResults from "./search/Results.vue";
import SearchDetailedResult from "./search/DetailedResult.vue";
import Toastr from "./utils/Toastr.vue";

export default {
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
	created: function() {
		this._switchModal = (name,options) => {
			this.modalWindowComponent = (this.modalWindowComponent==name?undefined:name);
		}
		this._closeModal = () => {
			this.modalWindowComponent = undefined;
		}
		this.$bus.$on("switchModal",this._switchModal);
		this.$bus.$on("closeModal",this._closeModal);
		this.$promises.register("mapReady");
	},
	mounted: function() {
		navigator.geolocation && navigator.geolocation.getCurrentPosition(position => {
			this.$store.dispatch("viewport/update",{what:"center",e:new google.maps.LatLng(position.coords.latitude,position.coords.longitude)});
		});
		this.$refs.map.$mapCreated.then(() => {
			this.map = this.$refs.map.$mapObject;
			this.map.setOptions({
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
			this.map.addListener("bounds_changed",() => {
				this.$bus.$emit("mapBoundsChanged",this.map.getBounds());
			});
			this.map.addListener("click",(e) => {
				if (e.placeId) {
					e.stop();
					this.$bus.$emit("toggleDetailedResult",e.placeId,"poi");
				}
			});
			this._setMapBounds = (results) => {
				const bounds = new google.maps.LatLngBounds();
				results.forEach((r) => {
					if (r.geometry && r.geometry.viewport) {
						bounds.union(r.geometry.viewport);
					}
					else if (r.geometry && r.geometry.location) {
						bounds.extend(r.geometry.location);
					}
				});
				this.map.fitBounds(bounds);
			}
			this._setMapCenter = (center) => {
				this.map.panTo(center);
			}
			this.$bus.$on("setMapBounds",this._setMapBounds);
			this.$bus.$on("setMapCenter",this._setMapCenter);
			this.$promises.resolve("mapReady",this.map);
		});
	},
	beforeDestroy: function() {
		["switchModal","closeModal","setMapBounds","setMapCenter"].forEach((f) => {
			this.hasOwnProperty("_"+f) && this.$bus.$off(f,this["_"+f]);
		});
		this.$promises.unregister("mapReady");
	},
	destroyed: function() {
		this.$promises.unregister("mapReady");
	},
	components: {
		Manager: Manager,
		Project: Project,
		ProjectMarkers: ProjectMarkers,
		ProjectMarkerInfo: ProjectMarkerInfo,
		ProjectInfoEditor: ProjectInfoEditor,
		SearchBox: SearchBox,
		SearchResults: SearchResults,
		SearchDetailedResult: SearchDetailedResult,
		Toastr: Toastr
	}
}
</script>