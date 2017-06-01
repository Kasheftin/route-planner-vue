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
		</gmap-map>
		<transition name="rp-modal">
			<div v-if="projectInitialized">
				<ProjectSettings />
				<SearchBox />
			</div>
		</transition>
		<transition name="rp-modal">
			<template v-if="!projectInitialized">
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
import SearchBox from "./SearchBox.vue";
import SearchResults from "./SearchResults.vue";
import Toastr from "./Toastr.vue";

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
	methods: {
		addPOIHook: function() {
			const self = this;
			if (google.maps.InfoWindow.prototype.POIHookAdded) return;
			var set = google.maps.InfoWindow.prototype.set;
			google.maps.InfoWindow.prototype.set = function(key,val) {
				if (key == "map") {
					const $content = $(this.content);
					if ($content.find(".POIHook").length==0) {
						const $link = $("<a href='#'>Add to Map</a>");
						$link.click(() => {
							const address = [];
							$content.find("div.address > div").each(function() {
								address.push($(this).text());
							});
							const r = {
								name: $content.find("div.title").text(),
								formatted_address: address.join(", "),
								geometry: {
									location: this.getPosition()
								}
							}
							self.$bus.$emit("tryAddSearchResult",r,(resultType) => {
								if (resultType=="success") {
									this.close();
								}
							});
						});
						$content.find("div.gm-style:first-child").append($("<div class='POIHook'></div>").append($link));
					}
				}
				set.apply(this,arguments);
			}
			google.maps.InfoWindow.prototype.POIHookAdded = true;
		}
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
			this.addPOIHook();
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
			this.$bus.$on("setMapBounds",this._setMapBounds);
			this.$promises.resolve("mapReady",this.map);
		});
	},
	beforeDestroy: function() {
		["switchModal","closeModal","setMapBounds"].forEach((f) => {
			this.hasOwnProperty("_"+f) && this.$bus.$off(f,this["_"+f]);
		});
		this.$promises.unregister("mapReady");
	},
	destroyed: function() {
		this.$promises.unregister("mapReady");
	},
	components: {
		ProjectManager: ProjectManager,
		ProjectSettings: ProjectSettings,
		ProjectInfoEditor: ProjectInfoEditor,
		SearchBox: SearchBox,
		SearchResults: SearchResults,
		Toastr: Toastr
	}
}
</script>