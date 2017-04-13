import frappe, frappe.utils
from frappe.utils.verified_command import get_signed_params, verify_request
from frappe import _
import urlparse, urllib
from frappe.email.doctype.newsletter.newsletter import get_email_groups


def get_context(context):
	print "================>>>>>>>>>> Testing"
	context.heading = "Unsubscribe from Newsletter"
	context.title = "Unsubscribe from Newsletter"
	context.message = "Select the email groups to unsubscribe from:"
	context.button = "Unsubscribe"

	if not verify_request():
		context.heading = "Invalid Link"
		context.message = "This link is invalid or expired. Please make sure you have pasted correctly."
		context.button = "Home"
		return
		
	query_string = frappe.local.flags.signed_query_string or getattr(frappe.request, 'query_string', None)
	params = frappe._dict(urlparse.parse_qsl(query_string.split("&_signature=")[0]))
	
	email_groups = get_email_groups(params.name)
	context.email_groups = [d.email_group for d in email_groups]

