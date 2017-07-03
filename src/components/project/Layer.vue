<template>
	<div class="rp-layer" :class="{'-selected':selected,'-invisible':!layer.visible,'-highlighted':highlighted}" @click="selectLayer()">
		<a href="javascript:void(0)" class="rp-layer-header" @click="switchLayerExpanded" :class="{'-inactive':!layer.visible,'-active':selected}">
			<div class="rp-layer-header-expand-icon">
				<span class="icon" :class="{'icon-calcplus':!layer.expanded,'icon-calcminus':layer.expanded}"></span>
			</div>
			<div class="rp-layer-header-title">{{layer.name}}</div>
			<transition :css="false" @before-enter="iconAnimBeforeEnter" @enter="iconAnimEnter" @leave="iconAnimLeave">
				<div class="rp-layer-header-expand-icon" v-if="selected" @click.stop="editLayer">
					<span class="icon icon-cog"></span>
				</div>
			</transition>
			<div class="rp-layer-header-visible-icon" @click.stop="switchLayerVisible">
				<span class="icon" :class="{'icon-check':layer.visible,'icon-uncheck':!layer.visible}"></span>
			</div>
		</a>
		<transition :css="false" @before-enter="bodyAnimBeforeEnter" @enter="bodyAnimEnter" @leave="bodyAnimLeave">
			<div class="rp-layer-body-container" v-if="layer.expanded">
				<div class="rp-layer-body">
					<div class="rp-layer-body-empty" v-show="showEmpty" ref="empty">-- Empty --</div>
					<Draggable class="rp-layer-body-list" :options="{group:'shapes',handle:'.rp-layer-draggable'}" :value="shapes" :move="checkMove" @start="startMove($event)" @end="moveShape($event)" :data-layer-id="layer.id">
						<template v-for="s in shapes">
							<template v-if="s.type=='marker'">
								<a href="javascript:void(0)" class="rp-layer-marker rp-layer-draggable" :key="s.id" @click="flyToAndShowMarkerInfo(s)">
									<i class="rp-layer-marker-icon" :style="{backgroundImage:'url('+s.icon+')'}"></i>
									<span class="rp-layer-marker-text">{{s.name}}</span>
								</a>
							</template>
							<template v-if="s.type=='dot'">
								<a href="javascript:void(0)" class="rp-layer-marker rp-layer-draggable" :key="s.id" @click="flyToAndShowDotInfo(s)">
									<i class="rp-layer-marker-icon" :style="{backgroundImage:'url('+s.icon+')'}"></i>
									<span class="rp-layer-marker-text">{{s.name}}</span>
								</a>
							</template>
							<template v-if="s.type=='polygon'">
								<a href="javascript:void(0)" class="rp-layer-polygon rp-layer-draggable" :key="s.id" @click="flyToAndShowPolygonInfo(s)">
									<span class="icon icon-transform"></span>
									<span class="rp-layer-polygon-text">{{s.name}}</span>
								</a>
							</template>
							<template v-if="s.type=='route'">
								<div class="rp-layer-route rp-layer-draggable" :key="s.id" :ref="'shape'+s.id">
									<div class="clearfix">
										<div class="rp-layer-route-header pull-left">
											<span class="icon icon-directions" v-if="s.editing"></span>
											<span class="icon fa-icon" v-if="!s.editing" :class="'icon-'+s.mode"></span>
											<span class="rp-layer-route-header-text" v-text="routeName(s)"></span>
										</div>
										<a class="rp-layer-route-header-control" href="javascript:void(0)" v-if="s.editing" @click="remove(s)"><span class="icon-times"></span></a>
										<a class="rp-layer-route-header-control" href="javascript:void(0)" v-else @click="editRoute(s)"><span class="icon-cog"></span></a>
									</div>
									<div class="clearfix rp-layer-route-settings" v-if="s.editing">
										<div class="pull-left">
											<div class="btn-group btn-group-xs">
												<button class="btn btn-default" :class="{'btn-primary':s.mode=='driving'}" @click="setRouteMode(s,'driving')"><span class="fa-icon icon-driving"></span></button>
												<button class="btn btn-default" :class="{'btn-primary':s.mode=='transit'}" @click="setRouteMode(s,'transit')"><span class="fa-icon icon-transit"></span></button>
												<button class="btn btn-default" :class="{'btn-primary':s.mode=='walking'}" @click="setRouteMode(s,'walking')"><span class="fa-icon icon-walking"></span></button>
												<button class="btn btn-default" :class="{'btn-primary':s.mode=='bicycling'}" @click="setRouteMode(s,'bicycling')"><span class="fa-icon icon-bicycling"></span></button>
											</div>
										</div>
										<div class="pull-right rp-layer-route-checkboxes">
											<div class="checkbox checkbox-inline">
												<label>
													<input type="checkbox" :checked="s.notolls" @change="setRouteNoTolls(s,!s.notolls)">
													No Tolls
												</label>
											</div>
											<div class="checkbox checkbox-inline">
												<label>
													<input type="checkbox" :checked="s.nohighways" @change="setRouteNoHighways(s,!s.nohighways)">
													No HW
												</label>
											</div>
										</div>
									</div>
									<Draggable class="rp-layer-route-routes" :options="{handle:'.rp-layer-route-draggable'}" :value="s.waypoints" v-if="s.editing" @end="moveWaypoint(s,$event)">
										<div class="input-group input-group-sm rp-layer-route-routes-item rp-layer-route-draggable" v-for="w,i in s.waypoints">
											<span class="input-group-addon">{{i+1}}</span>
											<input type="text" class="form-control" placeholder="-- Empty destination --" :value="w" @focus="createWaypointAutocomplete(s,i,$event)" @blur="destroyWaypointAutocomplete(s,i,$event)" />
											<a class="btn btn-default input-group-addon" v-if="s.waypoints.length>2" @click="removeWaypoint(s,i)">
												<span class="icon icon-times"></span>
											</a>
										</div>
									</Draggable>
									<div class="rp-layer-route-routes-view" v-else>
										<div class="rp-layer-routes-item" v-for="w,i in s.waypoints">
											<span class="badge">{{i+1}}</span>
											<span>{{w}}</span>
										</div>
										<div class="rp-layer-route-routes-stat">
											{{s.distance|distance}}
											{{s.duration|duration}}
										</div>
									</div>
									<div class="clearfix" v-if="s.editing">
										<div class="pull-left">
											<button class="btn btn-default btn-sm" @click="addWaypoint(s)">
												<span class="icon-plus"></span>
												Add waypoint
											</button>
										</div>
										<div class="pull-right">
											<button class="btn btn-default btn-sm" disabled="disabled" v-if="s.loading">
												<span class="icon-loading icon-spin"></span>
												Loading...
											</button>
											<button class="btn btn-default btn-sm" v-else @click="buildRoute(s)">
												<span class="icon-checkmark"></span>
												Apply
											</button>
										</div>
									</div>
								</div>
							</template>
						</template>
					</Draggable>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import Velocity from "velocity-animate";
import LayerInfoEditor from "./LayerInfoEditor.vue";

export default {
	props: ["layer","selected"],
	data: function() {
		return {
			highlighted: false,
			dragging: false
		};
	},
	computed: {
		showEmpty: function() {
			if (this.dragging) return false;
			return this.$store.getters["project/layerShapes"](this.layer.id).length==0;
		},
		shapes: function() {
			return this.$store.getters["project/layerShapes"](this.layer.id);
		}
	},
	methods: {
		selectLayer: function() {
			this.$bus.$emit("selectLayer",this.layer.id);
		},
		switchLayerExpanded: function() {
			this.$store.dispatch("project/switchLayerExpanded",{id:this.layer.id}).catch(result => this.$bus.$emit("error",result));
		},
		switchLayerVisible: function() {
			this.$store.dispatch("project/switchLayerVisible",{id:this.layer.id}).then(result => {
				this.$bus.$emit("selectLayer",this.layer.id);
			}).catch(result => this.$bus.$emit("error",result));
		},
		editLayer: function() {
			this.$bus.$emit("switchModal",LayerInfoEditor,{layer:this.layer});
		},
		iconAnimBeforeEnter: function(el) {
			el.style.width = 0;
		},
		iconAnimEnter: function(el,done) {
			Velocity(el,{width:$(el).find(".icon").outerWidth(true)},{duration:300,complete:() => {
				el.style.width = "auto";
				done();
			}});
		},
		iconAnimLeave: function(el,done) {
			Velocity(el,{width:0},{duration:300,complete:done});
		},
		bodyAnimBeforeEnter: function(el) {
			el.style.height = 0;
		},
		bodyAnimEnter: function(el,done) {
			Velocity(el,{height:$(el).find(".rp-layer-body").outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		bodyAnimLeave: function(el,done) {
			Velocity(el,{height:0},{duration:300,complete:done});
		},
		startMove: function(e) {
			this.$bus.$emit("shapeDragging",true);
		},
		checkMove: function(e) {
			// TODO: hide/show `-- Empty --` dynamicaly
			return true;
		},
		moveShape: function(e) {
			this.$bus.$emit("shapeDragging",false);
			this.$store.dispatch("project/moveShape",e);
		},
		flyToAndShowMarkerInfo: function(data) {
			this.$bus.$emit("setMapCenter",data.position);
			this.$bus.$emit("showMarkerInfo",data);
		},
		flyToAndShowDotInfo: function(data) {
			this.$bus.$emit("setMapCenter",data.position);
			this.$bus.$emit("showDotInfo",data);
		},
		flyToAndShowPolygonInfo: function(data) {
			this.$bus.$emit("setMapBounds",data.path);
			this.$bus.$emit("showPolygonInfo",data);
		},
		routeName: function(s) {
			const filledWaypoints = _.filter(s.waypoints,w => !!w);
			if (filledWaypoints.length>1) {
				return filledWaypoints[0]+" - "+filledWaypoints[filledWaypoints.length-1];
			}
			else {
				return "Untitled route";
			}
		},
		remove: function(s) {
			this.$store.dispatch("project/removeShape",s).then(result => {
				this.$bus.$emit("success",result);
				if (s.type=="route") {
					this.$bus.$emit("destroyRoute",s);
				}
			}).catch(result => this.$bus.$emit("error",result));
		},
		addWaypoint: function(s) {
			const w = [
				...s.waypoints,
				""
			];
			this.$store.dispatch("project/setShapeData",{id:s.id,waypoints:w}).then(result => {
				this.$bus.$emit("success","Waypoint added");
			}).catch(result => this.$bus.$emit("error",result));
		},
		removeWaypoint: function(s,i) {
			const w = [
				...s.waypoints.slice(0,i),
				...s.waypoints.slice(i+1)
			];
			console.log(i,s.waypoints,w);
			this.$store.dispatch("project/setShapeData",{id:s.id,waypoints:w}).then(result => {
				this.$bus.$emit("success","Waypoint removed");
			}).catch(result => { console.log(result); this.$bus.$emit("error",result)});
		},
		moveWaypoint: function(s,e) {
			this.$store.dispatch("project/moveShapeWaypoint",{id:s.id,oldIndex:e.oldIndex,newIndex:e.newIndex}).then(result => {
			}).catch(result => this.$bus.$emit("error",result));
		},
		createWaypointAutocomplete: function(s,i,e) {
			this.$promises.when("mapReady").then((map) => {
				this.waypointAutocomplete = new google.maps.places.SearchBox(e.target,{bounds:map.getBounds()});
				this.waypointAutocomplete.addListener("places_changed",() => {
					const places = this.waypointAutocomplete.getPlaces();
					if (places && places.length>0) {
						const w = [
							...s.waypoints.slice(0,i),
							places[0].formatted_address,
							...s.waypoints.slice(i+1)
						];
						this.$store.dispatch("project/setShapeData",{id:s.id,waypoints:w}).then(result => {
						}).catch(result => this.$bus.$emit("error",result));
					}
				});
			});
		},
		destroyWaypointAutocomplete: function(s,i,e) {
//			delete this.waypointAutocomplete;
			console.log("destroyWaypointAutocomplete",arguments);
		},
		editRoute: function(s) {
			this.$store.dispatch("project/setShapeData",{id:s.id,editing:true});
		},
		buildRoute: function(s) {
			this.$store.dispatch("project/setShapeData",{id:s.id,loading:true});
			this.$bus.$emit("buildRoute",s,false,(resultType,result) => {
				if (resultType=="success") {
					this.$store.dispatch("project/setShapeData",{id:s.id,editing:false,loading:false});
				}
				else {
					this.$store.dispatch("project/setShapeData",{id:s.id,loading:false});
					this.$bus.$emit("error",result);
				}
			});
		},
		setRouteMode: function(s,mode) {
			this.$store.dispatch("project/setShapeData",{id:s.id,mode:mode});
		},
		setRouteNoTolls: function(s,b) {
			this.$store.dispatch("project/setShapeData",{id:s.id,notolls:b});
		},
		setRouteNoHighways: function(s,b) {
			this.$store.dispatch("project/setShapeData",{id:s.id,nohighways:b});
		}
	},
	mounted: function() {
		this._highlightLayer = (id) => {
			if (this.layer.id==id) {
				this.highlighted = true;
				this._highlightTimeout && clearTimeout(this._highlightTimeout);
				this._highlightTimeout = setTimeout(() => {
					this.highlighted = false;
				},1000);
			}
		}
		this._shapeDragging = (b) => {
			this.dragging = b;
		}
		this._mapBoundsChanged = (b) => {
			if (this.waypointAutocomplete) {
				this.waypointAutocomplete.setBounds(b);
			}
		}
		this._shapeFocus = (s) => {
			this.$nextTick(() => {
				if (this.$refs["shape"+s.id]) {
					console.log("shape focus");
					$(this.$refs["shape"+s.id]).find("input[type=text]").get(0).focus();
				}
			});
		}
		this.$bus.$on("shapeDragging",this._shapeDragging);
		this.$bus.$on("highlightLayer",this._highlightLayer);
		this.$bus.$on("mapBoundsChanged",this._mapBoundsChanged);
		this.$bus.$on("shapeFocus",this._shapeFocus);
	},
	beforeDestroy: function() {
		this._shapeDragging && this.$bus.$off("shapeDragging",this._shapeDragging);
		this._highlightLayer && this.$bus.$off("highlightLayer",this._highlightLayer);
		this._mapBoundsChanged && this.$bus.$off("mapBoundsChanged",this._mapBoundsChanged);
		this._shapeFocus && this.$bus.$off("shapeFocus",this._shapeFocus);
	}
}

</script>