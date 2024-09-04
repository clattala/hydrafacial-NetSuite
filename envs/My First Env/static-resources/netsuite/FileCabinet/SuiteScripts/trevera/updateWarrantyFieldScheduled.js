/**
 * updateWarrantyFieldScheduled.ts
 * by Trevera, Inc.
 * shelby.severin@trevera.com
 *
 * @NScriptName HydraFacial | Update Customer Warranty Status
 * @NScriptType ScheduledScript
 * @NApiVersion 2.x
 */
define(["N/log", "N/search", "N/record"], function (log, search, record) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execute = void 0;
    function execute() {
        var recordsToUpdate = {};
        var warrantySearch = search.load({ id: 'customsearch_warranty_registration_sum' });
        var pageData = warrantySearch.runPaged();
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var customer = result.getValue({ name: 'custrecord_wrm_reg_customer', summary: search.Summary.GROUP });
                var status = result.getValue({ name: 'custrecord_wrm_reg_status', summary: search.Summary.GROUP });
                recordsToUpdate[customer] = recordsToUpdate[customer] || {
                    customer: customer,
                    numberActiveWarranties: 0,
                    hasActiveWarranty: false,
                    hasInactiveWarranty: false
                };
                recordsToUpdate[customer].customer = result.getValue({ name: 'custrecord_wrm_reg_customer', summary: search.Summary.GROUP });
                if (status == 'Under Warranty') {
                    recordsToUpdate[customer].hasActiveWarranty = true;
                    recordsToUpdate[customer].numberActiveWarranties = Number(result.getValue({ name: 'custrecord_wrm_reg_quantity', summary: search.Summary.SUM }));
                }
                if (status == 'Out of Warranty') {
                    recordsToUpdate[customer].hasInactiveWarranty = true;
                }
                return true;
            });
        });
        for (var warrantyRec in recordsToUpdate) {
            var rec = recordsToUpdate[warrantyRec];
            if (rec.numberActiveWarranties) {
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: rec.customer,
                    values: {
                        'custentity_hf_account_has_warranty': true,
                        'custentity_hf_number_warranties': rec.numberActiveWarranties
                    },
                    options: { ignoreMandatoryFields: true }
                });
            }
            if (!rec.hasActiveWarranty && rec.hasInactiveWarranty) {
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: rec.customer,
                    values: {
                        'custentity_hf_account_has_warranty': true,
                        'custentity_hf_number_warranties': 0
                    },
                    options: { ignoreMandatoryFields: true }
                });
            }
        }
        log.audit(recordsToUpdate.length + " customers updated", 'all customer records updated with warranty information');
    }
    exports.execute = execute;
    return exports;
});
