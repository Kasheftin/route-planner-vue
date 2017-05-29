<template>
	<div class="rp-layer" :class="{'-selected':selected,'-invisible':!layer.visible}" @click="trySelectLayer()">
		<div class="rp-layer-header">
			<div class="rp-layer-header-controls">
				<a class="fa" href="javascript:void(0)" @click="$store.dispatch('project/switchLayerVisibility',layer)" :class="{'fa-check-square-o':layer.visible,'fa-square-o':!layer.visible}"></a>
			</div>
			<a class="rp-layer-header-title" href="javascript:void(0)" @click="tryExpandLayer()" :class="{'-inactive':!layer.visible,'-active':selected}">
				<i class="fa" :class="{'fa-plus-square':!layer.expanded,'fa-minus-square':layer.expanded,'hidden':!layer.visible}"></i> {{layer.name}}
			</a>
		</div>
		<div class="rp-layer-body" v-if="layer.expanded">
			body {{layer._id}}
		</div>
	</div>
</template>

<script>

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
		}
	}
}

</script>

<style lang="scss">

.rp-layer {
	border-top: 1px solid #e5e5e5;
	border-left: 4px solid transparent;
	padding: 10px;
	padding-left: 6px;
	background-color: #ffffff;
	font-size: 13px;
	&.-selected {
		border-left: 4px solid #4d90fe;
	}
	&-header {
		a {
			@include linkcontrol;
		}
		&-controls {
			float: right;
		}
		&-title {
			font-weight: bold;
		}
	}
}

</style>