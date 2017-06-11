const PromisesBus = function() {
	this.promises = {};
	this.resolves = {};
	this.rejects = {};
}
PromisesBus.prototype.when = function(what) {
	return this.register(what);
},
PromisesBus.prototype.register = function(what) {
	if (this.promises.hasOwnProperty(what)) {
		return this.promises[what];
	}
	this.promises[what] = new Promise((resolve,reject) => {
		this.resolves[what] = resolve;
		this.rejects[what] = reject;
	});
	return this.promises[what];
}
PromisesBus.prototype.unregister = function(what) {
	this.register(what);
	delete this.promises[what];
	delete this.resolves[what];
	delete this.rejects[what];
}
PromisesBus.prototype.resolve = function(what) {
	this.register(what);
	this.resolves[what].apply(this.promises[what],Array.prototype.slice.call(arguments,1));
}
PromisesBus.prototype.reject = function(what) {
	this.register(what);
	this.rejects[what].apply(this.promises[what],Array.prototype.slice.call(arguments,1));
}

export default PromisesBus;