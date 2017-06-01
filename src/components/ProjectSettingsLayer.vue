<template>
	<div class="rp-layer" :class="{'-selected':selected,'-invisible':!layer.visible}" @click="trySelectLayer()">
		<a href="javascript:void(0)" class="rp-layer-header" @click="tryExpandLayer()" :class="{'-inactive':!layer.visible,'-active':selected}">
			<transition :css="false" @before-enter="iconAnimBeforeEnter" @enter="iconAnimEnter" @leave="iconAnimLeave">
				<div class="rp-layer-header-expand-icon" v-if="layer.visible">
					<i class="fa" :class="{'fa-plus-square':!layer.expanded,'fa-minus-square':layer.expanded}"></i>
				</div>
			</transition>
			<div class="rp-layer-header-title">{{layer.name}}</div>
			<div class="rp-layer-header-visible-icon" @click.stop="switchLayerVisibility">
				<i class="fa" :class="{'fa-check-square-o':layer.visible,'fa-square-o':!layer.visible}"></i>
			</div>
		</a>
		<transition :css="false" @before-enter="bodyAnimBeforeEnter" @enter="bodyAnimEnter" @leave="bodyAnimLeave">
			<div class="rp-layer-body-container" v-if="layer.expanded">
				<div class="rp-layer-body">
					<div class="rp-layer-body-empty" v-if="layer.shapes.length==0">-- Empty --</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>

import Velocity from "velocity-animate";

export default {
	props: ["layer","selected"],
	computed: {
		visible: function() {
			return this.layer.visible;
		}
	},
	watch: {
		visible: function(v) {
			if (!v) {
				this.$store.dispatch("project/contractLayer",this.layer);
				this.$emit("deselectLayer");
			}
		}
	},
	methods: {
		trySelectLayer: function() {
			if (this.layer.visible) {
				this.$emit("selectLayer");
			}
		},
		tryExpandLayer: function() {
			if (this.layer.visible) {
				this.$store.dispatch("project/switchLayerExpand",this.layer);
			}
		},
		switchLayerVisibility: function() {
			this.$store.dispatch('project/switchLayerVisibility',this.layer);
			this.$emit("selectLayer");
		},
		iconAnimBeforeEnter: function(el) {
			el.style.width = 0;
		},
		iconAnimEnter: function(el,done) {
			Velocity(el,{width:$(el).find(".fa").outerWidth(true)},{duration:300,complete:() => {
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
		}
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
	&-header {
		@include flexbox;
		@include linkcontrol;
		&-title {
			@include flex-grow(1);
		}
		&-expand-icon {
			overflow: hidden;
			.fa {
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
		&-empty {
			padding: 5px;
			background-color: #dedede;
		}
	}
}

</style>