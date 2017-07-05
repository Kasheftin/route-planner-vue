<template></template>

<script>

export default {
	data: function() {
		return {
			enabled: true
		}
	},
	mounted: function() {
		this.$promises.when("mapReady").then((map) => {
			this._hashchange = () => {
				if (!this.enabled) return;
				let query = {};
				(document.location.hash||"").replace(/^#/,"").split(/&/).forEach(s => {
					const ar = s.split(/=/);
					if (ar[0] && ar[1]) {
						query[decodeURIComponent(ar[0])] = decodeURIComponent([ar[1]]);
					}
				});
				query = _.pick(query,"id","privateId");
				if (query.id) {
					this.$bus.$emit("loadProject",query,(resultType,result) => {
						this.$bus.$emit("isReady",true);
					});
				}
				else {
					this.$bus.$emit("isReady",true);
				}
			}
			this._setRoute = (project) => {
				this.enabled = false;
				let query = "";
				_.each(_.pick(project||{},"id","privateId"),(v,i) => {
					if (v && i) {
						query += (query.length>0?"&":"")+encodeURIComponent(i)+"="+encodeURIComponent(v);
					}
				});
				document.location.hash = query;
				_.defer(() => {
					this.enabled = true;
				});
			}
			$(window).on("hashchange",this._hashchange);
			this.$bus.$on("setRoute",this._setRoute);
			this._hashchange();
		});
	},
	beforeDestroy: function() {
		this._hashchange && $(window).off("hashchange",this._hashchange);
		this._setRoute && this.$bus.$off("setRoute",this._setRoute);
	}
}

</script>