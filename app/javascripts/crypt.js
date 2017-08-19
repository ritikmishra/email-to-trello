const crypto = require("crypto");
const key = require("./key");
const ct_encoding = "hex";
const pass_encoding = "utf8";
const algorithm = "aes-256-cbc";

function encrypt(pass, cb) {
	var iv = crypto.randomBytes(16);
	key.giveKey((err, keytext) => {
		if (err) {
			cb(err, null);
		}
		else {
			var cipher = crypto.createCipheriv(algorithm, keytext, iv);
			let ciphertext = cipher.update(pass, pass_encoding, ct_encoding);
			ciphertext += cipher.final(ct_encoding);
			cb(null, {text: ciphertext, iv: iv});
		}
	});
}

function decrypt(text, iv, cb) {
	try {
		key.giveKey((err, keytext) => {
			if (err) {
				cb(err, null);
			}
			else {
				var decipher = crypto.createDecipheriv(algorithm, keytext, iv);
				var pass = decipher.update(text, ct_encoding, pass_encoding);
				pass += decipher.final(pass_encoding);
				cb(null, pass);
			}

		});
	} catch (e) {
		cb(e, null);
	}
}

function encrypt_promise(pass) {
	return new Promise((fulfill, reject) => {
		try {
			var iv = crypto.randomBytes(16);
		}
		catch (e) {
			reject(e);
		}
		key.giveKeyPromise()
			.then((keytext) => {
				try {
					var cipher = crypto.createCipheriv(algorithm, keytext, iv);
					let ciphertext = cipher.update(pass, pass_encoding, ct_encoding);
					ciphertext += cipher.final(ct_encoding);
					fulfill({text: ciphertext, iv: iv});
				}
				catch (e) {
					reject(e);
				}
			})
			.catch(reject);
	});
}

function decrypt_promise(text, iv) {
	return new Promise((fullfill, reject) => {
		key.giveKeyPromise()
			.then((keytext) => {
				try {
					var decipher = crypto.createDecipheriv(algorithm, keytext, iv);
					var pass = decipher.update(text, ct_encoding, pass_encoding);
					pass += decipher.final(pass_encoding);
					fullfill(pass);
				}
				catch (e) {
					reject(e);
				}
			})
			.catch(reject);
	});
}

module.exports = {
	encrypt: encrypt,
	decrypt: decrypt,
	encrypt_promise: encrypt_promise,
	decrypt_promise: decrypt_promise
};
