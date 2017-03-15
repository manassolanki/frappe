# Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals

import frappe
from frappe.utils import now
from frappe import _

no_cache = True

def get_context(context):
	print "===========>>>>> context <<<<<<============="

	# if frappe.session.user != "Guest" and frappe.session.data.user_type=="System User":

	context.heading = "Unsubscribe"
	context["title"] = "Unsubscribe"
	context["indicator_color"] = "green"
	context["message"] = "Select the mailing-list to unsubscribe:"
	context["email_group_list"] = ["news", "letter", "check"]
	print frappe.flags