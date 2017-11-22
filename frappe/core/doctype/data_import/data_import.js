// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Data Import', {

	setup: function(frm) {
		var doctype_options = "";
		for (var i=0, l=frappe.boot.user.can_import.sort().length; i<l; i++) {
			doctype_options = doctype_options + "\n" + frappe.boot.user.can_import[i];
		}
		frm.get_field('reference_doctype').df.options = doctype_options;
		frm.disable_save();
	},

	onload: function(frm) {
		frappe.realtime.on("data_import", function(data) {
			if(data.progress) {
				frappe.hide_msgprint(true);
				frappe.show_progress(__("Importing"), data.progress[0],
					data.progress[1]);
			}
		});		
	},

	refresh: function(frm) {
		frm.add_custom_button(__("Help"), function() {
			frappe.help.show_video("6wiriRKPhmg");
		});

		if(frm.doc.reference_doctype) {
			frm.add_custom_button(__("Download template"), function() {
				frappe.route_options = {"reference_doctype": frm.doc.reference_doctype};
				frappe.set_route('Form', 'Export Template');
			});
		}

		if (frm.doc.reference_doctype && frm.doc.import_file) {
			frm.add_custom_button(__("Validate Template"), function() {
				frm.events.data_import(frm, true);
			});
			frm.add_custom_button(__("Start Import"), function() {
				frm.events.data_import(frm, false);
			}).addClass('btn btn-primary');
		}

		if (frm.doc.log_details) {
			frm.events.write_messages(frm);
			if (frm.doc.import_status == "Success") {
				frm.disable_save();
			} else {
				frm.enable_save();
			}
		}
	},

	reference_doctype: function(frm) {
		frm.save();
	},

	import_file: function(frm) {
		frm.save();
	},

	only_new_records: function(frm) {
		frm.save();
	},

	only_update: function(frm) {
		frm.save();
	},

	submit_after_import: function(frm) {
		frm.save();
	},

	skip_errors: function(frm) {
		frm.save();
	},

	ignore_encoding_errors: function(frm) {
		frm.save();
	},

	no_email: function(frm) {
		frm.save();
	},

	data_import: function(frm, validate) {
		frappe.call({
			method: "import_data",
			doc: frm.doc,
			args: {
				validate: validate
			},
			callback: function(r) {
				frm.refresh();
			}
		});
	},

	write_messages: function(frm) {
		msg = JSON.parse(frm.doc.log_details);
		var $log_wrapper = $(frm.fields_dict.import_log.wrapper).empty();
		
		frappe.hide_msgprint(true);
		frappe.hide_progress();

		if (msg.error == false) {
			$(frappe.render_template("log_detail_template", {data:msg.messages}))
				.appendTo($log_wrapper);	
		}
		else {
			$(frappe.render_template("log_detail_template", {data:msg.messages}))
				.appendTo($log_wrapper);
		}
	}
});


	// add_primary_class: function(frm) {
	// 	if(frm.class_added) return;
	// 	setTimeout(function() {
	// 		try {
	// 			frm.get_field('import_button').$input.addClass("btn-primary btn-md")
	// 				.removeClass('btn-xs');
	// 			// frm.get_field('import_file').$input.addClass("btn-primary btn-md")
	// 			// 	.removeClass('btn-xs');
	// 			frm.class_added = true;
	// 		} catch (err) {
	// 			frm.class_added = false;
	// 		}
	// 	}, 500)
	// },

	// import_button: function(frm) {
	// 	if (!frm.doc.import_file) {
	// 		frappe.msgprint("Attach a file for importing")
	// 	} else {
	// 		frappe.realtime.on("data_import", function(data) {
	// 			if(data.progress) {
	// 				frappe.hide_msgprint(true);
	// 				frappe.show_progress(__("Importing"), data.progress[0],
	// 					data.progress[1]);
	// 			}
	// 		})
	// 		// frm.save()
	// 		// 	.then( () => {
	// 		// 		console.log("frappe call");
	// 		// 		frappe.call({
	// 		// 			method: "import_data",
	// 		// 			doc:frm.doc,
	// 		// 			callback: function(r) {
	// 		// 				console.log(r);	
	// 		// 			}
	// 		// 		});
	// 		// 	});
	// 	}
	// },

