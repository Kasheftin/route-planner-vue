<template>
	<transition-group name="rp-toastrs" tag="div" class="rp-toastrs" :css="false" @before-enter="beforeEnter" @enter="enter" @leave="leave">
		<div class="rp-toastr-container" v-for="(n,i) in notifications" :key="n.key">
			<div class="rp-toastr alert" :class="'alert-'+n.css">
				<button type="button" class="close icon-times" @click="close(i,$event)"></button>
				<button type="button" class="close icon-pin" v-if="!n.pinned" @click="n.pinned=true"></button>
				{{n.message}}
			</div>
		</div>
	</transition-group>
</template>

<script>

import Velocity from "velocity-animate";

export default {
	props: {
		duration: {
			type: Number,
			default: 3000
		}
	},
	data: function() {
		return {
			notifications: []
		}
	},
	methods: {
		close: function(i,e) {
			e.currentTarget.blur();
			this.notifications.splice(i,1);
		},
		beforeEnter: function(el) {
			el.style.opacity = 0;
			el.style.height = 0;
		},
		enter: function(el,done) {
			Velocity(el,{opacity:1,height:$(el).find(".rp-toastr").outerHeight(true)},{duration:300,complete:() => {
				el.style.height = "auto";
				done();
			}});
		},
		leave: function(el,done) {
			Velocity(el,{opacity:0,height:0},{duration:300,complete:done});
		}
	},
	created: function() {
		const cn = (messageOrResult,type) => {
			let message = messageOrResult;
			if (_.isObject(messageOrResult)) {
				message = messageOrResult.msg;
			}
			this.notifications.push({type:type,css:(type=="error"?"danger":type),message:message,created:(new Date).getTime(),show:true,pinned:false,key:Math.random()});
			if (type=="error") console.error(messageOrResult);
			else console.log(messageOrResult);
		}
		this._se = (message) => cn(message,"error");
		this._ss = (message) => cn(message,"success");
		this._si = (message) => cn(message,"info");
		this.$bus.$on("error",this._se);
		this.$bus.$on("success",this._ss);
		this.$bus.$on("info",this._si);
		const run = () => {
			const t = (new Date).getTime();
			this.notifications = _.filter(this.notifications,(n) => n.pinned || n.created+this.duration>t);
			this._tm = setTimeout(run,500);
		}
		run();
	},
	beforeDestroy: function() {
		this.$bus.$off("error",this._se);
		this.$bus.$off("success",this._ss);
		this.$bus.$off("info",this._si);
		this._tm && clearTimeout(this._tm);
	}
}

</script>