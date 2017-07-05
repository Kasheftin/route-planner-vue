<template>
	<transition :css="false" @before-enter="beforeEnter" @enter="enter" @leave="leave">
		<div v-if="show" class="clearfix nooverflow">
			<div class="alert" :class="[className,css]">
				<button type="button" class="close rp-alert-icon-close" @click="close"><span class="icon-times"></span></button>
				{{message}}
				<div class="clearfix text-center" v-if="buttons.length">
					<button v-for="button in buttons" class="btn btn-default" :class="button.class" @click="button.action">{{button.label}}</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>

import Velocity from "velocity-animate";

export default {
	data: function() {
		return {
			show: false,
			type: "",
			message: "",
			buttons: []
		};
	},
	props: ["data","css"],
	computed: {
		className: function() {
			if (this.type=="error") return "alert-danger";
			if (this.type) return "alert-"+this.type;
			return "";
		}
	},
	watch: {
		data: function(data) {
			this.nextData = data;
			if (this.working) return;
			const p = new Promise((resolve,reject) => {
				this.working = true;
				if (this.show) {
					this.show = false;
					_.delay(resolve,300);
				}
				else resolve();
			});
			p.then(() => {
				if (this.nextData) {
					this.type = this.nextData.type;
					this.message = this.nextData.message;
					this.show = true;
					this.buttons = this.nextData.buttons||[];
				}
				this.working = false;
			});
		}
	},
	methods: {
		beforeEnter: function(el) {
			el.style.opacity = 0;
			el.style.height = 0;
		},
		enter: function(el,done) {
			Velocity(el,{opacity:1,height:$(el).find(".alert").outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		leave: function(el,done) {
			Velocity(el,{opacity:0,height:0},{duration:300,complete:done});
		},
		close: function() {
			this.show = false;
		}
	}
}

</script>