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
			<ProjectMarkers />
			<ProjectMarkerInfo />
			<ProjectDotInfo />
			<ProjectPolygonInfo />
		</gmap-map>
		<transition name="rp-modal">
			<div v-if="projectInitialized&&isReady">
				<Project />
				<SearchBox />
				<ToolBox />
			</div>
		</transition>
		<transition name="rp-modal">
			<template v-if="!projectInitialized&&isReady">
				<Manager />
			</template>
		</transition>
		<transition name="rp-modal">
			<component :is="modalWindowComponent" v-bind="modalWindowProps" />
		</transition>
		<Toastr />
		<Router />
	</div>
</template>

<script>
import {mapState,mapActions,mapMutations,mapGetters} from "vuex";
import Manager from "./Manager.vue";
import Project from "./project/Main.vue";
import ProjectMarkers from "./project/Markers.vue";
import ProjectMarkerInfo from "./project/MarkerInfo.vue";
import ProjectDotInfo from "./project/DotInfo.vue";
import ProjectPolygonInfo from "./project/PolygonInfo.vue";
import SearchBox from "./search/Box.vue";
import SearchResults from "./search/Results.vue";
import SearchDetailedResult from "./search/DetailedResult.vue";
import ToolBox from "./tools/Box.vue";
import Toastr from "./utils/Toastr.vue";
import config from "../config";
import Router from "./Router.vue";

const routes = {};

export default {
	data: function() {
		return {
			modalWindowComponent: undefined,
			modalWindowProps: undefined,
			isReady: false
		}
	},
	computed: {
		...mapState("viewport",{
			center: state => state.center,
			zoom: state => state.zoom,
			mapTypeId: state => state.mapTypeId
		}),
		...mapState("project",{
			projectInitialized: state => !!state.id,
			shapes: state => state.shapes
		}),
		...mapGetters("project",["visibleRoutesIs"]),
		...mapState("tool",{
			tool: state => state.name
		})
	},
	watch: {
		projectInitialized: function(b) {
			if (!b) {
				this.$store.dispatch("tool/setTool");
			}
		},
		shapes: function(shapes) {
			_.each(shapes,s => {
				if (s.type=="route") {
					this.$bus.$emit("buildRoute",s,true);
				}
			});
		},
		tool: function(tool) {
			this.map && this.map.setOptions({draggableCursor:tool=="marker"?"crosshair":null});
		},
		visibleRoutesIs: function(ids) {
			this.updateVisibleRoutes(ids);
		}
	},
	methods: {
		updateVisibleRoutes: function(ids) {
			_.each(routes,(r,id) => {
				r.setMap(ids[id]?this.map:undefined);
			});
		},
		drawRoute: function(id,route,preserveViewport) {
			if (routes[id]) {
				routes[id].setMap(undefined);
				delete routes[id];
			}
			routes[id] = new google.maps.DirectionsRenderer({draggable:true,map:this.visibleRoutesIs[id]?this.map:undefined});
			if (preserveViewport) routes[id].setOptions({preserveViewport:preserveViewport});
			routes[id].setDirections(route);
			routes[id].addListener("directions_changed",() => {
				const directions = routes[id].getDirections();
				this.updateRouteStat(id,directions);
				if (directions && directions.geocoded_waypoints) {
					const p = [];
					directions.geocoded_waypoints.forEach(wp => {
						p.push(new Promise((resolve,reject) => {
							this.$bus.$emit("getDetailedResult",wp.place_id,(resultType,result) => {
								resolve(resultType=="success"?result:null);
							});
						}));
					});
					Promise.all(p).then(values => {
						this.$store.dispatch("project/setShapeData",{id:id,waypoints:_.map(values,v => v?v.formatted_address:"")});
					});
				}
			});
		},
		clearRoute: function(id) {
			if (routes[id]) {
				routes[id].setMap(undefined);
			}
			delete routes[id];
		},
		updateRouteStat: function(id,stat) {
			let totalDistance = 0;
			let totalDuration = 0;
			if (stat.routes.length>0) {
				stat.routes[0].legs.forEach(leg => {
					totalDistance += leg.distance.value;
					totalDuration += leg.duration.value;
				});
			}
			this.$store.dispatch("project/setShapeData",{id:id,distance:totalDistance,duration:totalDuration});
		},
		latLng2Point: function(latLng,map) {
			const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
			const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
			const scale = Math.pow(2,map.getZoom());
			const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
			return new google.maps.Point((worldPoint.x-bottomLeft.x)*scale,(worldPoint.y-topRight.y)*scale);
		},
		point2LatLng: function(point,map) {
			const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
			const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
			const scale = Math.pow(2,map.getZoom());
			const worldPoint = new google.maps.Point(point.x/scale+bottomLeft.x,point.y/scale+topRight.y);
			return map.getProjection().fromPointToLatLng(worldPoint);
		}
	},
	created: function() {
		this._switchModal = (nameOrComponent,options) => {
			this.modalWindowProps = (this.modalWindowComponent==nameOrComponent?undefined:options);
			this.modalWindowComponent = (this.modalWindowComponent==nameOrComponent?undefined:nameOrComponent);
		}
		this._closeModal = () => {
			this.modalWindowComponent = undefined;
			this.modalWindowProps = undefined;
		}
		this.$bus.$on("switchModal",this._switchModal);
		this.$bus.$on("closeModal",this._closeModal);
	},
	mounted: function() {
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
				else if (this.tool=="marker") {
					this.$bus.$emit("tryAdd","dot",e,(resultType,shape) => {
						if (resultType=="success") {
							this.$store.dispatch("tool/setTool");
							this.$bus.$emit("showDotInfo",shape,true);
							this.$bus.$emit("updateDotGeocode",shape);
						}
					});
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
					else if (r.lat && r.lng) {
						bounds.extend(r);
					}
				});
				this.map.fitBounds(bounds);
			}
			this._setMapCenter = (center) => {
				this.map.panTo(center);
			}
			this._updateDotGeocode = (shape,mode) => {
				if (shape.geocode && (shape.geocode.status==0||mode=="coordsUpdated") && !shape.geocode.loading && shape.position) {
					this.$store.dispatch("project/setShapeGeocodeData",{id:shape.id,loading:true});
					const geocoder = new google.maps.Geocoder;
					geocoder.geocode({location:shape.position},(results,status) => {
						if (status=="OK" && results.length>0) {
							this.$store.dispatch("project/setShapeGeocodeData",{id:shape.id,status:1,data:results[0].formatted_address});
						}
						else {
							this.$store.dispatch("project/setShapeGeocodeData",{id:shape.id,status:2,data:""});
						}
						this.$store.dispatch("project/setShapeGeocodeData",{id:shape.id,loading:false});
					});
				}
			}
			this._updatePolygonArea = (shape) => {
				let area = 0;
				if (shape && shape.path && shape.path.length>0) {
					area = google.maps.geometry.spherical.computeArea(_.map(shape.path,p => new google.maps.LatLng(p.lat,p.lng)));
				}
				this.$store.dispatch("project/setShapeData",{id:shape.id,area:area});
			}
			this._buildRoute = (shape,preserveViewport,callback) => {
				const filledWaypoints = _.filter(shape.waypoints,w => !!w);
				if (!filledWaypoints || filledWaypoints.length<2) return callback && callback("error",{msg:"Can not build the route - waypoints are not filled correctly."});
				const ds = new google.maps.DirectionsService();
				ds.route({
					origin: filledWaypoints[0],
					destination: filledWaypoints[filledWaypoints.length-1],
					waypoints: _.map(filledWaypoints.slice(1,-1),v=>{return {location:v};}),
					travelMode: google.maps.TravelMode[shape.mode.toUpperCase()],
					provideRouteAlternatives: false,
					avoidHighways: shape.nohighways,
					avoidTolls: shape.notolls
				},(response,status) => {
					if (status == google.maps.DirectionsStatus.OK) {
						this.updateRouteStat(shape.id,response);
						this.drawRoute(shape.id,response,preserveViewport);
						return callback && callback("success");
					}
					else return callback && callback("error",{msg:"Failed to build the route."});
				});
			}
			this._destroyRoute = (shape,callback) => {
				delete routes[shape.id];
				this.clearRoute(shape.id);
			}
			this._tryAddPolygon = (callback) => {
				const cp = this.latLng2Point(this.map.getCenter(),this.map);
				const p1 = this.point2LatLng({x:cp.x-100,y:cp.y-80},this.map);
				const p2 = this.point2LatLng({x:cp.x+100,y:cp.y-80},this.map);
				const p3 = this.point2LatLng({x:cp.x+100,y:cp.y+80},this.map);
				const p4 = this.point2LatLng({x:cp.x-100,y:cp.y+80},this.map);
				const path = _.map([p1,p2,p3,p4],p=>{return{lat:p.lat(),lng:p.lng()}});
				this.$bus.$emit("tryAdd","polygon",{path:path},callback);
			}
			this._makeRequest = (data,callback) => {
				$.ajax({
					url: config.api.url,
					type: "post",
					dataType: "json",
					data: data,
					success: (result) => callback(result.type,result),
					error: (xhr,settings,errorMessage) => {
						const data = JSON.parse(xhr.responseText||errorMessage);
						const result = (typeof data=="object" && data.hasOwnProperty("type")) ? data : {type:"error",message:data};
						return callback(result.type,result);
					}
				});
			}
			this._loadProject = (project,callback) => {
				this.$bus.$emit("makeRequest",_.pick(project,"id","privateId"),(resultType,result) => {
					if (resultType=="success") {
						this.$bus.$emit("openProject",result.data,callback);
					}
					else {
						this.$bus.$emit("error",result.message);
						callback && callback(resultType,result);
					}
				});
			}
			this._openProject = (data,callback) => {
				this.$store.dispatch("project/loadProject",data.project).then(result => {
					this.$bus.$emit("success",result.msg);
					this.$bus.$emit("setRoute",data.project);
					this.$store.dispatch("viewport/set",data.viewport);
					callback && callback("success",result);
				}).catch(result => {
					this.$bus.$emit("error",result.msg);
					callback && callback("error",result);
				});
			}
			this._isReady = (isReady) => {
				this.isReady = isReady;
			}
			this.$bus.$on("setMapBounds",this._setMapBounds);
			this.$bus.$on("setMapCenter",this._setMapCenter);
			this.$bus.$on("updateDotGeocode",this._updateDotGeocode);
			this.$bus.$on("updatePolygonArea",this._updatePolygonArea);
			this.$bus.$on("buildRoute",this._buildRoute);
			this.$bus.$on("destroyRoute",this._destroyRoute);
			this.$bus.$on("tryAddPolygon",this._tryAddPolygon);
			this.$bus.$on("makeRequest",this._makeRequest);
			this.$bus.$on("loadProject",this._loadProject);
			this.$bus.$on("openProject",this._openProject);
			this.$bus.$on("isReady",this._isReady);
			this.$promises.resolve("mapReady",this.map);
		});
	},
	beforeDestroy: function() {
		["switchModal","closeModal","setMapBounds","setMapCenter","buildRoute","destroyRoute","tryAddPolygon","updateDotGeocode","updatePolygonArea","makeRequest","loadProject","openProject","isReady"].forEach((f) => {
			this.hasOwnProperty("_"+f) && this.$bus.$off(f,this["_"+f]);
		});
	},
	destroyed: function() {
		this.$promises.unregister("mapReady");
	},
	components: {
		Manager,
		Project,
		ProjectMarkers,
		ProjectMarkerInfo,
		ProjectDotInfo,
		ProjectPolygonInfo,
		SearchBox,
		SearchResults,
		SearchDetailedResult,
		ToolBox,
		Toastr,
		Router
	}
}
</script>