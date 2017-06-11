<template>
	<div class="rp-layer" :class="{'-selected':selected,'-invisible':!layer.visible,'-highlighted':highlighted}" @click="selectLayer()">
		<a href="javascript:void(0)" class="rp-layer-header" @click="expandLayer()" :class="{'-inactive':!layer.visible,'-active':selected}">
			<div class="rp-layer-header-expand-icon">
				<span class="icon" :class="{'icon-calcplus':!layer.expanded,'icon-calcminus':layer.expanded}"></span>
			</div>
			<div class="rp-layer-header-title">{{layer.name}}</div>
			<transition :css="false" @before-enter="iconAnimBeforeEnter" @enter="iconAnimEnter" @leave="iconAnimLeave">
				<div class="rp-layer-header-expand-icon" v-if="selected" @click.stop="editLayer">
					<span class="icon icon-cog"></span>
				</div>
			</transition>
			<div class="rp-layer-header-visible-icon" @click.stop="switchLayerVisibility">
				<span class="icon" :class="{'icon-check':layer.visible,'icon-uncheck':!layer.visible}"></span>
			</div>
		</a>
		<transition :css="false" @before-enter="bodyAnimBeforeEnter" @enter="bodyAnimEnter" @leave="bodyAnimLeave">
			<div class="rp-layer-body-container" v-if="layer.expanded">
				<div class="rp-layer-body">
					<div class="rp-layer-body-empty" v-show="showEmpty" ref="empty">-- Empty --</div>
					<Draggable class="rp-layer-body-list" :options="{group:'shapes',handle:'.rp-layer-draggable'}" :value="layer.shapes" :move="checkMove" @start="startMove($event)" @end="moveShape($event)" :data-layer-id="layer.id">
						<a v-for="s in layer.shapes" v-if="s.type=='marker'" href="javascript:void(0)" class="rp-layer-marker rp-layer-draggable" @click="flyToAndShowMarkerInfo(s.data)">
							<i class="rp-layer-marker-icon" :style="{backgroundImage:'url('+s.data.icon+')'}"></i>
							<span class="rp-layer-marker-text">{{s.data.name}}</span>
						</a>
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
			return this.layer.shapes.length==0;
		}
	},
	methods: {
		selectLayer: function() {
			this.$emit("selectLayer");
		},
		expandLayer: function() {
			this.$store.dispatch("project/switchLayerExpand",this.layer);
		},
		switchLayerVisibility: function() {
			this.$store.dispatch('project/switchLayerVisibility',this.layer);
			this.$emit("selectLayer");
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
		this.$bus.$on("shapeDragging",this._shapeDragging);
		this.$bus.$on("highlightLayer",this._highlightLayer);
	},
	beforeDestroy: function() {
		this._highlightLayer && this.$bus.$off("highlightLayer",this._highlightLayer);
		this._shapeDragging && this.$bus.$off("shapeDragging",this._shapeDragging);
	}
}

</script>

<style lang="scss" scoped>
.rp-layer {
	border-top: 1px solid #e5e5e5;
	border-left: 4px solid transparent;
	padding: 10px;
	padding-left: 6px;
	background-color: #ffffff;
	font-size: 13px;
	transition: all 0.3s ease;
	&.-selected {
		border-left-color: #4d90fe;
	}
	&.-highlighted {
		background-color: $state-info-bg;
	}
	&-header {
		@include flexbox;
		@include linkcontrol;
		&-title {
			@include flex-grow(1);
		}
		&-expand-icon {
			overflow: hidden;
			.icon {
				margin-right: 5px;
			}
		}
	}
	&-body-container {
		overflow: hidden;
	}
	&-body {
		border-top: 1px dotted #e5e5e5;
		padding: 8px 0;
		margin-top: 5px;
		margin-left: 15px;
		position: relative;
		&-empty {
			padding: 5px;
			position: absolute;
			top: 8px;
			left: 0;
			right: 0;
			z-index: 1;
		}
		&-list {
			min-height: 30px;
			position: relative;
			z-index: 2;
		}
	}
	&-marker {
		@include flexbox;
		padding: 4px;
		&:hover {
			background-color: #efefef;
			text-decoration: none;
		}
		&:focus {
			text-decoration: none;
		}
		&-icon {
			@include flex(0 0 auto);
			height: 18px;
			width: 18px;
			margin-right: 5px;
			background: transparent 50% 50% no-repeat;
			background-size: contain;
		}
		&-text {
			@include flex(1 1 auto);
			line-height: 18px;
		}
	}
}
</style>
