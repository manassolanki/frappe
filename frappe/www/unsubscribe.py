# Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
import frappe.utils
from frappe import _
from frappe.utils.verified_command import get_signed_params, verify_request

no_cache = True

def get_context(context):
	print "===========>>>>> context <<<<<<============="

	# if frappe.session.user != "Guest" and frappe.session.data.user_type=="System User":
	print "verify request", verify_request()
	if not verify_request():
		context.heading = "Invalid Link"
		context["title"] = "Invalid Link"
		context["card_title"] = "Invalid Link"
		context["indicator_color"] = "red"
		context["message"] = "This link is invalid or expired. Please make sure you have pasted correctly."
	else:
		context.heading = "Unsubscribe"
		context["title"] = "Unsubscribe"
		context["card_title"] = "Unsubscribe"
		context["indicator_color"] = "green"
		context["message"] = "Select the mailing-list to unsubscribe:"
		context["email_group_list"] = ["news", "letter", "check"]
	print frappe.flags
	print dir(frappe.request)
	print "print frappe request query_string====>>>", frappe.request.query_string
	print "print url here ====>> ", frappe.utils.get_url()
	# print frappe.request.url


		# frappe.respond_as_web_page(_("Invalid Link"),
		# 	_("This link is invalid or expired. Please make sure you have pasted correctly."))
