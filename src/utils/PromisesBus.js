const PromisesBus = function() {
	this.promises = {};
	this.resolves = {};
	this.rejects = {};
}
PromisesBus.prototype.when = function(what) {
	if (!this.promises.hasOwnProperty(what)) {
		throw new Error("Promise "+what+" is not registered");
	}
	return this.promises[what];
},
PromisesBus.prototype.register = function(what) {
	if (this.promises.hasOwnProperty(what)) {
		throw new Error("Promise "+what+" is already registered");
	}
	this.promises[what] = new Promise((resolve,reject) => {
		this.resolves[what] = resolve;
		this.rejects[what] = reject;
	});
}
PromisesBus.prototype.unregister = function(what) {
	if (!this.promises.hasOwnProperty(what)) {
		throw new Error("Promise "+what+" is not registered");
	}
	delete this.promises[what];
	delete this.resolves[what];
	delete this.rejects[what];
}
PromisesBus.prototype.resolve = function(what) {
	if (!this.promises.hasOwnProperty(what)) {
		throw new Error("Promise "+what+" is not registered");
	}
	this.resolves[what].apply(this.promises[what],Array.prototype.slice.call(arguments,1));
}
PromisesBus.prototype.reject = function(what) {
	if (!this.promises.hasOwnProperty(what)) {
		throw new Error("Promise "+what+" is not registered");
	}
	this.rejects[what].apply(this.promises[what],Array.prototype.slice.call(arguments,1));
}

export default PromisesBus;