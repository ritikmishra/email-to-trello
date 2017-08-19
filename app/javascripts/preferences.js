const crypt = require("./crypt");
const fs = require("fs");

const file_location = process.env.HOME + "/.email_to_trello/credentials.json";
const dir = process.env.HOME + "/.email_to_trello/";

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

function store_data(trelloemail, email, passwd, server) {
	let data_obj = {};
	crypt.encrypt(passwd, (err, data) => {
		if (err) throw err;
		data_obj.ciphertext = data.text;
		data_obj.iv = data.iv;
		data_obj.email = email;
		data_obj.trelloemail = trelloemail;
		data_obj.server = server;
		fs.writeFile(file_location, JSON.stringify(data_obj), "utf-8",
			(err) => {
				if (err) throw err;
			});
	});
}

function store_data_promise(trelloemail, email, passwd, server) {
	let data_obj = {};
	crypt.encrypt_promise(passwd)
		.then((data) => {
			data_obj.ciphertext = data.text;
			data_obj.iv = data.iv;
			data_obj.email = email;
			data_obj.trelloemail = trelloemail;
			data_obj.server = server;
			fs.writeFile(file_location, JSON.stringify(data_obj), "utf-8",
				(err) => {
					if (err) throw err;
				});
		})
		.catch((err) => {
			throw err;
		});
}

function read_data(cb) {
	let data_obj = {};
	fs.readFile(file_location, "utf-8", (err, data) => {
		if (err) {
			cb(err, null);
			throw err;
		}
		else {
			data_obj = JSON.parse(data);
			data_obj.iv = Buffer.from(data_obj.iv.data);
			console.log(data_obj.iv);
			crypt.decrypt(data_obj.ciphertext, data_obj.iv, (err, passwd) => {
				if (err) {
					cb(err, null);
				}
				else {
					cb(null, {
						email: data_obj.email,
						passwd: passwd,
						server: data_obj.server,
						trelloemail: data_obj.trelloemail
					});
				}
			});
		}
	});
}

function read_data_promise() {
	return new Promise((fulfill, reject) => {
		let data_obj = {};
		fs.readFile(file_location, "utf-8", (err, data) => {
			if (err) {
				reject(err);
			}
			else {
				try {
					data_obj = JSON.parse(data);
					data_obj.iv = Buffer.from(data_obj.iv.data);
					console.log(data_obj.iv);
				}
				catch (e) {
					reject(e);
				}
				crypt.decrypt_promise(data_obj.ciphertext, data_obj.iv)
					.then((passwd) => {
						fulfull({
							email: data_obj.email,
							passwd: passwd,
							server: data_obj.server,
							trelloemail: data_obj.trelloemail
						});
					})
					.catch(reject);
			}
		});
	});
}

function load_data() {
	read_data((err, data_obj) => {
		if (err) {
			throw err;
		}
		document.getElementById("trello_email").value = data_obj.trelloemail;
		document.getElementById("email").value = data_obj.email;
		document.getElementById("smtp").value = data_obj.server;
		document.getElementById("passwd").value = data_obj.passwd;
	});
}

function read_data_promise() {
	read_data_promise()
		.then((data_obj) => {
			document.getElementById("trello_email").value = data_obj.trelloemail;
			document.getElementById("email").value = data_obj.email;
			document.getElementById("smtp").value = data_obj.server;
			document.getElementById("passwd").value = data_obj.passwd;
		})
		.catch((err) => {
			throw err;
		});
}

function save_data() {
	document.getElementById("notif").innerHTML = "";
	store_data(
		document.getElementById("trello_email").value,
		document.getElementById("email").value,
		document.getElementById("passwd").value,
		document.getElementById("smtp").value.toLowerCase()
	);
	document.getElementById("notif").innerHTML = "Saved!";
}

function save_data_promise() {
	document.getElementById("notif").innerHTML = "";
	store_data_promise(
		document.getElementById("trello_email").value,
		document.getElementById("email").value,
		document.getElementById("passwd").value,
		document.getElementById("smtp").value.toLowerCase()
	);
	document.getElementById("notif").innerHTML = "Saved!";
}

module.exports = {
	store_data: store_data,
	store_data_promise: store_data_promise,

	read_data: read_data,
	read_data_promise: read_data_promise,

	load_data: load_data,
	read_data_promise: read_data_promise,

	save_data: save_data,
	save_data_promise: save_data_promise
};
