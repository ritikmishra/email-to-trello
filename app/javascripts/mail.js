"use strict";
const nodemailer = require("nodemailer");
const prefs = require("./preferences");

var me, trello, transporter;


function send_email() {
	// setup email data with unicode symbols
	var title, desc;
	title = document.getElementById("title").value;
	desc = document.getElementById("desc").value;
	document.getElementById("notif").innerHTML = "";
	document.getElementById("title").value = "";
	document.getElementById("desc").value = "";
	update_transporter((err) => {
		let mailOptions = {
			from: me, // sender address
			to: trello, // list of receivers
			subject: document.getElementById("title").value, // Subject line
			text: document.getElementById("desc").value, // plain text body
			html: "" // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				document.getElementById("notif").innerHTML = error;
				document.getElementById("title").value = title;
				document.getElementById("desc").value = desc;
			}
			document.getElementById("notif").innerHTML = "Message " + info.messageId + " sent: " + info.response;

		});
	});
}

function update_transporter(cb) {
	prefs.read_data((err, data_obj) => {
		if (err) {
			throw err;
		}

		me = data_obj.email;
		trello = data_obj.trelloemail;
		transporter = nodemailer.createTransport({
			host: data_obj.server,
			port: 465,
			secure: true, // secure:true for port 465, secure:false for port 587
			auth: {
				user: data_obj.email,
				pass: data_obj.passwd
			}
		});
		cb(null);

	});
}

update_transporter((a) => {
});

var export_funcs = {
	send_email: send_email,
	update_transporter: update_transporter
};
module.exports = export_funcs;
