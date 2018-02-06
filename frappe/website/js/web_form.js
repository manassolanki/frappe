// frappe.provide('frappe.ui.form.ControlAutocomplete');
frappe.provide("frappe.ui");

frappe.ready(function() {
	frappe.file_reading = false;
	frappe.form_dirty = false;
	// console.log(boot_info);
	frappe.sys_defaults = {};
	$.extend(frappe, web_form_settings);
	$.extend(frappe.sys_defaults, boot_info);
	$.extend(frappe.boot, boot_info);


	frappe.web_form_settings = window.web_form_settings;
	const { web_form_doctype, web_form_name } = web_form_settings;

	const page_wrapper = $(`.page-container[data-path="${web_form_name}"] .page-content .page-content-wrapper .page_content`);

	frappe.call({
		method: 'frappe.website.doctype.web_form.web_form.get_web_form_data',
		args: { web_form_name }
	}).then(r => {
		// console.log("web form doc", r.message);
		const web_form_doc = r.message;
		if (web_form_settings.is_list) {
			render_list(web_form_doc, page_wrapper);
		} else {
			frappe.model.with_doctype(web_form_doc.doc_type, function() {
				render_form(web_form_doc, page_wrapper);
			});
		}
	});
});

// {% block header_actions %}
// 	{% if not read_only and has_header %}
// 	<div style="padding-bottom: 15px;">
// 	    {% if login_required -%}
// 		<a href="{{ cancel_url or pathname }}" class="btn btn-default btn-sm">
// 	    	{{ _("Cancel") }}</a>
// 		{%- endif %}
// 		{% if not is_list %}
// 	    <button type="submit" class="btn btn-primary btn-sm btn-form-submit">
// 	    		{{ _("Save") }}</button>
// 		{% endif %}
// 	</div>
// 	{% endif %}
// 	{% if is_list %}
// 	<div style="padding-bottom: 15px;">
// 	    <a href="/{{ pathname }}{{ delimeter }}new=1{{ params_from_form_dict}}" class="btn btn-primary btn-new btn-sm">
// 	    {{ _("New") }}
// 	    </a>
// 	</div>
// 	{% endif %}
// 	{%- if allow_print and not is_list and not _login_required -%}
// 	<div class='text-right'>
// 		<a class='text-muted small' href='/printview?doctype={{ doc.doctype}}&name={{ doc.name }}
// 			{%- if print_format -%}&format={{ print_format }}{%- endif -%}' target="_blank" rel="noopener noreferrer">
// 			<i class='fa fa-print'></i> {{ _("Print") }}</a>
// 	</div>
// 	{%- endif -%}
// {% endblock %}


function render_head(web_form_doc, doc) {
	console.log(doc);
	const head_wrapper = $(`.page-container[data-path="${web_form_doc.name}"] .page-content .page-content-wrapper .page-head`);

	if (frappe.web_form_settings.is_list) {
		$(`<div class="col-sm-8"><h1>${web_form_doc.doc_type}</h1></div>`).appendTo(head_wrapper);
	} else {
		$(`<div class="col-sm-8"><h1>${doc.name}</h1></div>`).appendTo(head_wrapper);
	}
	const action_block = $(`<div class="col-sm-4"><div class="page-header-actions-block"></div></div>`).appendTo(head_wrapper);
	if (!frappe.web_form_settings.is_read_only && doc) {
		$(".page-header-actions-block").html(`<div style="padding-bottom: 15px;">
				<button type="submit" class="btn btn-primary btn-sm btn-form-submit">${ __("Save") }</button>
			</div>`);
	} else if (!frappe.web_form_settings.is_read_only && frappe.web_form_settings.is_list) {
		$(".page-header-actions-block").html(`<div style="padding-bottom: 15px;">
				<a href="/${web_form_doc.route}?new=1" class="btn btn-primary btn-new btn-sm">${ __("New") }</a>
			</div>`);
	}
}


function render_list(web_form_doc, wrapper) {
	frappe.call({
		method: 'frappe.client.get_list',
		args: {
			doctype: web_form_doc.doc_type,
			fields: ['name'],
			filters: { 'owner': frappe.session.user }
		}
	}).then(r => {
		const list = r.message || [];
		// console.log("list of issues", r);
		render_list_view(list);
		render_head(web_form_doc);
		
	});

	function render_list_view(list) {
		const html = list.map(get_list_row_html).join('');
		$(`<div class="website-list">${html}</div>`).appendTo(wrapper);
	}

	function get_list_row_html(row) {
		return `
			<a href="${web_form_doc.name}?name=${row.name}">
			<div class="row padding border-bottom">
				<div class="col-sm-4">${row.name}</div>
			</div>
			</a>
		`;
	}
}

function render_form(web_form_doc, wrapper) {
	// const { web_form_doctype: doctype, doc_name: name, web_form_name } = web_form_settings;

	frappe.call({
		method: 'frappe.website.doctype.web_form.web_form.get_form_data',
		args: { 
			doctype: frappe.web_form_settings.web_form_doctype,
			name: frappe.web_form_settings.doc_name
		}
	}).then(r => {
		// console.log(r);
		const doc = r.message;
		render_form(doc, web_form_doc);
		render_head(web_form_doc, doc);
	});


	function render_form(doc, web_form_doc) {
		const fields = web_form_doc.web_form_fields.map(df => {
			// if (df.fieldtype === 'Link') {
			// 	df.fieldtype = 'Data';
			// 	// link_field_list.push(df.fieldname);
			// }

			delete df.parent;
			delete df.parentfield;
			delete df.parenttype;
			// delete df.doctype;

			return df;
		});
		$(`<div class="introduction"><p class="text-muted">${web_form_doc.introduction_text}</p></div>
			<div class="form-message hide"></div><br>`).appendTo(wrapper);

		// console.log(fields);
		const layout = new frappe.ui.FieldGroup({
			parent: wrapper,
			fields: fields
		});

		layout.make();

		// console.log(layout);
		// for (var i in layout.fields_list) {
		// 	console.log(i);
		// 	let field = layout.fields_list[i];
		// 	if (field.input && link_field_list.includes(field.df.fieldname) ) {
		// 		// console.log(field);
		// 		// field.df.options = ["STD 1", "STD 2", "STD 3"];
		// 		// field_control = new frappe.ui.form.ControlAutocomplete(field);
		// 		// field_control.make_input();
		// 		console.log(field_control);
		// 		// var awesomplete = new Awesomplete(field.input, 
		// 		var awesomplete = new Awesomplete(field, {
		// 			minChars: 0,
		// 			maxItems: 99,
		// 			autoFirst: true,
		// 			list: ["STD I", "STD II"],
		// 			item: function(item, input) {
		// 				return $('<li>').text(item.value).get(0);
		// 			}
		// 		});
		// 		// 	filter: function(text, input) { return true },
		// 		// 	replace: function(text) {
		// 		// 		var before = this.input.value.match(/^.+,\s*|/)[0];
		// 		// 		this.input.value = before + text + ", ";
		// 		// 	}
		// 		// });
				
		// 		// setup_awesomplete_for_input(field.input);
		// 	}
		// }
	}
}

function setup_awesomplete_for_input(input) {
	function split(val) {
		return val.split( /,\s*/ );
	}
	function extractLast(term) {
		return split(term).pop();
	}

	var awesomplete = new Awesomplete(input, {
		minChars: 0,
		maxItems: 99,
		autoFirst: true,
		list: [],
		item: function(item, input) {
			return $('<li>').text(item.value).get(0);
		},
		filter: function(text, input) { return true },
		replace: function(text) {
			var before = this.input.value.match(/^.+,\s*|/)[0];
			this.input.value = before + text + ", ";
		}
	});
	var delay_timer;
	var $input = $(input);
	$input.on("input", function(e) {
		clearTimeout(delay_timer);
		delay_timer = setTimeout(function() {
			var term = e.target.value;
			frappe.call({
				method:'frappe.email.get_contact_list',
				args: {
					'txt': extractLast(term) || '%'
				},
				quiet: true,
				callback: function(r) {
					awesomplete.list = r.message || [];
				}
			});
		},250);
	});
};

/*
frappe.ready(function() {
	console.log('web form');
	frappe.file_reading = false;
	frappe.form_dirty = false;

	$.extend(frappe, web_form_settings);
	moment.defaultFormat = frappe.moment_date_format;

	$('[data-toggle="tooltip"]').tooltip();

	var $form = $("form[data-web-form='"+frappe.web_form_name+"']");

	// read file attachment
	$form.on("change", "[type='file']", function() {
		var $input = $(this);
		if($input.attr("type")==="file") {
			var input = $input.get(0);
			var reader = new FileReader();

			if(input.files.length) {
				var file = input.files[0];
				frappe.file_reading = true;
				reader.onload = function(e) {
					input.filedata = {
						"__file_attachment": 1,
						"filename": file.name,
						"dataurl": reader.result
					};

					if(input.filedata.dataurl.length >
						(frappe.max_attachment_size * 1024 * 1024)) {
						frappe.msgprint(__('Max file size allowed is {0}MB',
							[frappe.max_attachment_size]));
						input.filedata = null

						// clear attachment
						$(input).val('');
						$(input).attr('data-value', '');
					}
					frappe.file_reading = false;
				}

				reader.readAsDataURL(file);
			}
		}
	});

	var set_mandatory_class = function(input) {
		if($(input).attr('data-reqd')) {
			$(input).parent().toggleClass('has-error', !!!$(input).val());
		}
	}

	// show mandatory fields as red
	$('.form-group input, .form-group textarea, .form-group select').on('change', function() {
		set_mandatory_class(this);
	}).on('keypress', function() {
		set_mandatory_class(this);

		// validate maxlength
		var maxlength = parseInt($(this).attr('maxlength'));
		if(maxlength && (($(this).val() || '') + '').length > maxlength-1) {
			$(this).val($(this).val().substr(0, maxlength-1));
		}
	}).each(function() { set_mandatory_class(this); });

	// if changed, set dirty flag
	$form.on('change', function() {
		frappe.form_dirty = true;
	});

	$form.on('submit', function() {
		return false;
	});

	// allow payment only if
	$('.btn-payment').on('click', function() {
		save(true);
		return false;
	});

	// change attach
	$form.on("click", ".change-attach", function() {
		var input_wrapper = $(this).parent().addClass("hide")
			.parent().find(".attach-input-wrap").removeClass("hide");

		input_wrapper.find('input').val('').attr('data-value', '');

		frappe.form_dirty = true;

		return false;
	});

	// change section
	$('.btn-change-section, .slide-progress .fa-fw').on('click', function() {
		var idx = $(this).attr('data-idx');
		if(!frappe.form_dirty || frappe.is_read_only) {
			show_slide(idx);
		} else {
			if(save()!==false) {
				show_slide(idx);
			}
		}
		return false;
	});

	var show_slide = function(idx) {
		// hide all sections
		$('.web-form-page').addClass('hidden');

		// slide-progress
		$('.slide-progress .fa-circle')
			.removeClass('fa-circle').addClass('fa-circle-o');
		$('.slide-progress .fa-fw[data-idx="'+idx+'"]')
			.removeClass('fa-circle-o').addClass('fa-circle');

		// un hide target section
		$('.web-form-page[data-idx="'+idx+'"]')
			.removeClass('hidden')
			.find(':input:first').focus();

	}

	// add row
	$('.btn-add-row').on('click', function() {
		var fieldname = $(this).attr('data-fieldname');
		var grid = $('.web-form-grid[data-fieldname="'+fieldname+'"]');
		var new_row = grid.find('.web-form-grid-row.hidden').clone()
			.appendTo(grid.find('tbody'))
			.attr('data-name', '')
			.removeClass('hidden');
		new_row.find('input').each(function() {
			$(this)
				.val($(this).attr('data-default') || "")
				.removeClass('hasDatepicker')
				.attr('id', '');
		});
		setup_date_picker(new_row);
		return false;
	});

	// remove row
	$('.web-form-grid').on('click', '.btn-remove', function() {
		$(this).parents('.web-form-grid-row:first').addClass('hidden').remove();
		frappe.form_dirty = true;
		return false;
	});

	// get document data
	var get_data = function() {
		frappe.mandatory_missing_in_last_doc = [];

		var doc = get_data_for_doctype($form, frappe.web_form_doctype);
		doc.doctype = frappe.web_form_doctype;
		if(frappe.doc_name) {
			doc.name = frappe.doc_name;
		}
		frappe.mandatory_missing = frappe.mandatory_missing_in_last_doc;

		// get data from child tables
		$('.web-form-grid').each(function() {
			var fieldname = $(this).attr('data-fieldname');
			var doctype = $(this).attr('data-doctype');
			doc[fieldname] = [];

			// get data from each row
			$(this).find('[data-child-row=1]').each(function() {
				if(!$(this).hasClass('hidden')) {
					frappe.mandatory_missing_in_last_doc = [];
					var d = get_data_for_doctype($(this), doctype);

					// set name of child record (if set)
					var name = $(this).attr('data-name');
					if(name) { d.name = name; }

					// check if child table has value
					var has_value = false;
					for(var key in d) {
						if(typeof d[key]==='string') {
							d[key] = d[key].trim();
						}
						if(d[key] !== null && d[key] !== undefined && d[key] !== '') {
							has_value = true;
							break;
						}
					}

					// only add if any value is set
					if(has_value) {
						doc[fieldname].push(d);
						frappe.mandatory_missing =
							frappe.mandatory_missing.concat(frappe.mandatory_missing_in_last_doc);
					}
				}
			});
		});

		return doc;
	}

	// get data from input elements
	// for the given doctype
	var get_data_for_doctype = function(parent, doctype) {
		var out = {};
		parent.find("[name][data-doctype='"+ doctype +"']").each(function() {
			var $input = $(this);
			var input_type = $input.attr("data-fieldtype");
			var no_attachment = false;

			if(input_type==="Attach") {
				// save filedata dict as value
				if($input.get(0).filedata) {
					var val = $input.get(0).filedata;
				} else {
					// original value
					var val = $input.attr('data-value');
					if (!val) {
						val = {'__no_attachment': 1}
						no_attachment = true;
					}
				}
			} else if(input_type==='Text Editor') {
				var val = $input.parent().find('.note-editable').html();
			} else if(input_type==="Check") {
				var val = $input.prop("checked") ? 1 : 0;
			} else if(input_type==="Date") {
				// convert from user format to YYYY-MM-DD
				if($input.val()) {
					var val = moment($input.val(), moment.defaultFormat).format('YYYY-MM-DD');
				} else {
					var val = null;
				}
			} else {
				var val = $input.val();
			}

			if(typeof val==='string') {
				val = val.trim();
			}

			if($input.attr("data-reqd")
				&& (val===undefined || val===null || val==='' || no_attachment)) {
				frappe.mandatory_missing_in_last_doc.push([$input.attr("data-label"),
					$input.parents('.web-form-page:first').attr('data-label')]);
			}

			out[$input.attr("name")] = val;
		});
		return out;
	}

	function save(for_payment) {
		if(window.saving)
			return false;
		window.saving = true;
		frappe.form_dirty = false;

		if(frappe.file_reading) {
			window.saving = false;
			frappe.msgprint(__("Uploading files please wait for a few seconds."));
			return false;
		}

		var data = get_data();
		if((!frappe.allow_incomplete || for_payment) && frappe.mandatory_missing.length) {
			window.saving = false;
			show_mandatory_missing();
			return false;
		}

		frappe.call({
			type: "POST",
			method: "frappe.website.doctype.web_form.web_form.accept",
			args: {
				data: data,
				web_form: frappe.web_form_name,
				for_payment: for_payment
			},
			freeze: true,
			btn: $form.find("[type='submit']"),
			callback: function(data) {
				if(!data.exc) {
					frappe.doc_name = data.message;
					if(!frappe.login_required) {
						show_success_message();
					}

					if(frappe.is_new && frappe.login_required) {
						// reload page (with ID)
						window.location.href = window.location.pathname + "?name=" + frappe.doc_name;
					}

					if(for_payment && data.message) {
						// redirect to payment
						window.location.href = data.message;
					}
				} else {
					frappe.msgprint(__('There were errors. Please report this.'));
				}
			},
			always: function() {
				window.saving = false;
			}
		});
		return true;
	}

	function show_success_message() {
		$form.addClass("hide");
		$(".comments, .introduction, .page-head").addClass("hide");
		scroll(0, 0);
		set_message(frappe.success_link, true);
	}

	function show_mandatory_missing() {
		var text = [], last_section = null;
		frappe.mandatory_missing.forEach(function(d) {
			if(last_section != d[1]) {
				text.push('');
				text.push(d[1].bold());
				last_section = d[1];
			}
			text.push(d[0]);
		});
		frappe.msgprint(__('The following mandatory fields must be filled:<br>')
			+ text.join('<br>'));
	}

	function set_message(msg, permanent) {
		$(".form-message")
			.html(msg)
			.removeClass("hide");

		if(!permanent) {
			setTimeout(function() {
				$(".form-message").addClass('hide');
			}, 5000);
		}
	}

	// submit
	$(".btn-form-submit").on("click", function() {
		save();
		return false;
	});

	// close button
	$(".close").on("click", function() {
		var name = $(this).attr("data-name");
		if(name) {
			frappe.call({
				type:"POST",
				method: "frappe.website.doctype.web_form.web_form.delete",
				args: {
					"web_form": frappe.web_form_name,
					"name": name
				},
				callback: function(r) {
					if(!r.exc) {
						location.reload();
					}
				}
			});
		}
	});

	// setup datepicker in all inputs within the given element
	var setup_date_picker = function(ele) {
		var $dates = ele.find("[data-fieldtype='Date']");
		var $date_times = ele.find("[data-fieldtype='Datetime']");

		// setup date
		if($dates.length) {
			$dates.datepicker({
				language: "en",
				autoClose: true,
				dateFormat: frappe.datepicker_format,
				onSelect: function(date, date_str, e) {
					e.$el.trigger('change');
				}
			});

			// initialize dates from YYYY-MM-DD to user format
			$dates.each(function() {
				var val = $(this).attr('value');
				if(val) {
					$(this).val(moment(val, 'YYYY-MM-DD').format()).trigger('change');
				}
			});
		}

		// setup datetime
		if($date_times.length) {
			$date_times.datepicker({
				language: "en",
				autoClose: true,
				dateFormat: frappe.datepicker_format,
				timepicker: true,
				timeFormat: "hh:ii:ss"
			});
		}
	}

	setup_date_picker($form);

	var summernotes = {};
	var setup_text_editor = function() {
		var editors = $('[data-fieldtype="Text Editor"]');
		editors.each(function() {
			if($(this).attr('disabled')) return;
			summernotes[$(this).attr('data-fieldname')] = $(this).summernote({
				minHeight: 400,
				toolbar: [
					['magic', ['style']],
					['style', ['bold', 'italic', 'underline', 'clear']],
					['fontsize', ['fontsize']],
					['color', ['color']],
					['para', ['ul', 'ol', 'paragraph']],
					['media', ['link', 'picture']],
					['misc', ['fullscreen', 'codeview']]
				],
				icons: frappe.summer_note_icons
			});
		});

	};
	setup_text_editor();
});

frappe.summer_note_icons = {
	'align': 'fa fa-align',
	'alignCenter': 'fa fa-align-center',
	'alignJustify': 'fa fa-align-justify',
	'alignLeft': 'fa fa-align-left',
	'alignRight': 'fa fa-align-right',
	'indent': 'fa fa-indent',
	'outdent': 'fa fa-outdent',
	'arrowsAlt': 'fa fa-arrows-alt',
	'bold': 'fa fa-bold',
	'caret': 'caret',
	'circle': 'fa fa-circle',
	'close': 'fa fa-close',
	'code': 'fa fa-code',
	'eraser': 'fa fa-eraser',
	'font': 'fa fa-font',
	'frame': 'fa fa-frame',
	'italic': 'fa fa-italic',
	'link': 'fa fa-link',
	'unlink': 'fa fa-chain-broken',
	'magic': 'fa fa-magic',
	'menuCheck': 'fa fa-check',
	'minus': 'fa fa-minus',
	'orderedlist': 'fa fa-list-ol',
	'pencil': 'fa fa-pencil',
	'picture': 'fa fa-image',
	'question': 'fa fa-question',
	'redo': 'fa fa-redo',
	'square': 'fa fa-square',
	'strikethrough': 'fa fa-strikethrough',
	'subscript': 'fa fa-subscript',
	'superscript': 'fa fa-superscript',
	'table': 'fa fa-table',
	'textHeight': 'fa fa-text-height',
	'trash': 'fa fa-trash',
	'underline': 'fa fa-underline',
	'undo': 'fa fa-undo',
	'unorderedlist': 'fa fa-list-ul',
	'video': 'fa fa-video-camera'
};

*/