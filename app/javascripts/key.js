const crypto = require("crypto");
const os = require("os");
const macaddress = require("macaddress");
const mac_promise = require("./macaddress");

function sha512(data) {
	const hash = crypto.createHash("sha256");

	hash.update(data);
	return hash.digest().slice(0, 32);
}

function giveKey(cb) {
	// Key is a buffer
	try {
		var OSName = os.type();
		var OSVersion = os.release();
		var CPUModel = os.cpus()[0].model;
		var MACaddress;
		macaddress.one((err, mac) => {
			if (err) {
				cb(err, null);
			}
			else {
				MACaddress = mac;
				cb(null, sha512(OSName + OSVersion + CPUModel + MACaddress));
			}
		});
	} catch (e) {
		cb(e, null);
	}
}

function giveKeyPromise() {
	return new Promise((fulfill, reject) => {
		try {
			var OSName = os.type();
			var OSVersion = os.release();
			var CPUModel = os.cpus()[0].model;

			mac_promise.one()
				.then((MACaddress) => {
					fulfill(sha512(OSName + OSVersion + CPUModel + MACaddress));
				})
				.catch((error) => {
					reject(error);
				});
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = {
	giveKey: giveKey,
	giveKeyPromise: giveKeyPromise
};
