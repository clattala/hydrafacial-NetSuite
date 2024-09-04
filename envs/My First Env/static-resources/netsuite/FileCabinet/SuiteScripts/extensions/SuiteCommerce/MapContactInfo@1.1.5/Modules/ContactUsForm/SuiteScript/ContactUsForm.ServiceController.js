/// <amd-module name="SuiteCommerce.ContactUsForm.ServiceController"/>
define("SuiteCommerce.ContactUsForm.ServiceController", ["require", "exports", "ServiceController"], function (require, exports, ServiceController) {
    "use strict";
    return ServiceController.extend({
        name: 'SuiteCommerce.ContactUsForm.ServiceController',
        post: function () {
            var suiteletInternalUrl = nlapiResolveURL('SUITELET', 'customscript_ns_sc_sl_contact_us_form', 'customdeploy_ns_sc_sl_contact_us_form', 'external');
            var headers = {
                Accept: 'application/json',
            };
            var responseObj = nlapiRequestURL(suiteletInternalUrl, JSON.stringify(this.data), headers);
            var responseStatusCode = parseInt(responseObj.getHeader('Custom-Header-Status'), 10);
            if (responseStatusCode === 200) {
                return JSON.parse(responseObj.getBody());
            }
            else {
                throw '';
            }
        }
    });
});
