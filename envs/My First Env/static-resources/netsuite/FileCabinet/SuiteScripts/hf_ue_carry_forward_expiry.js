/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
*/
define(['N/record', 'N/search'], function (record, search) {
    function afterSubmit(context) {
        try {
            var invoiceId = context.newRecord.getValue({ fieldId: 'custrecord_wrm_reg_invoice' });
            var item = context.newRecord.getValue({ fieldId: 'custrecord_wrm_reg_item' });
			var warrantyInternalId = context.newRecord.id;
            log.debug('Warranty Internal Id', warrantyInternalId);
            log.debug('Related Invoice', invoiceId);
            log.debug('Related Item', item);

            if (invoiceId) {
                var invoiceRecord = record.load({ type: record.Type.INVOICE, id: invoiceId });
                var warrantyCreditMemoValue = invoiceRecord.getValue('custbody_warranty_credit_memo');
                log.debug('Old Invoice', warrantyCreditMemoValue);

                if (warrantyCreditMemoValue) {
                    var customRecordSearch = search.create({
                        type: 'customrecord_wrm_warrantyreg',
                        filters: [
                            ['custrecord_wrm_reg_invoice', 'anyof', warrantyCreditMemoValue],
                            'AND',
                            ['custrecord_wrm_reg_item', 'anyof', item]
                        ],
                        columns: ['internalid', 'custrecord_wrm_reg_registration']
                    });

                    var searchResults = customRecordSearch.run().getRange({ start: 0, end: 1000 });

                    for (var i = 0; i < searchResults.length; i++) {
                        var recordId = searchResults[i].getValue('internalid');	// Old Warranty Registration record
                        var registrationNo = searchResults[i].getValue('custrecord_wrm_reg_registration');
                        log.debug('Warranty Registration Record', 'ID: ' + recordId + ', Registration No: ' + registrationNo);
                        if (recordId) {
                            executeAdditionalSearch(recordId, warrantyInternalId);
                        }
                    }
                }
            }
        } catch (e) {
            log.error('Error in afterSubmit', e);
        }
    }

    function executeAdditionalSearch(recordId, warrantyInternalId) {
        try {
            var existingSearch = search.load({ id: 'customsearch_hf_warranties_expiry' });
            var filters = existingSearch.filters;
            log.debug('filters', filters);

            filters.push(search.createFilter({ name: 'internalid', operator: search.Operator.ANYOF, values: recordId }));
            log.debug('Revised filters', filters);

            var allColumns = existingSearch.columns;
            var modifiedSearchResults = existingSearch.run().getRange({ start: 0, end: 1000 });

            for (var j = 0; j < modifiedSearchResults.length; j++) {
                var searchResult = modifiedSearchResults[j];
                var id = searchResult.getValue({ name: "id" });
                var registrationNo = searchResult.getValue({ name: "custrecord_wrm_reg_registration" });
                var inactive = searchResult.getValue({ name: "isinactive" });
                var creditMemoNo = searchResult.getValue({ name: "custrecord_hf_credit_memo_no" });
                var status = searchResult.getValue({ name: "custrecord_wrm_reg_status" });
                var date = searchResult.getValue({ name: "date", join: "systemNotes" });
                var field = searchResult.getValue({ name: "field", join: "systemNotes" });
                var oldValue = searchResult.getValue({ name: "oldvalue", join: "systemNotes" });
                var newValue = searchResult.getValue({ name: "newvalue", join: "systemNotes" });

                log.debug('Search Result', 'ID: ' + id + ', Registration No.: ' + registrationNo + ', Inactive: ' + inactive + ', Credit Memo: ' + creditMemoNo + ', Status: ' + status + ', Date: ' + date + ', Field: ' + field + ', Old Value: ' + oldValue + ', New Value: ' + newValue);
				
				var warrantyExpirationField = record.submitFields({
                type: 'customrecord_wrm_warrantyreg',
                id: warrantyInternalId,
                values: {
                    custrecord_wrm_reg_warrantyexpire: (inactive === 'Yes' || creditMemoNo || status === 'Out of Warranty') ? oldValue : newValue
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
				});
				// log.debug('Warranty Expiration Updated', 'Record ID: ' + warrantyInternalId + ', New Value: ' + search.lookupFields({
				// type: 'customrecord_wrm_warrantyreg',
				// id: warrantyInternalId,
				// columns: ['custrecord_wrm_reg_warrantyexpire']
				// }));
				// Fetch and log the updated value of 'Warranty Expiration' field using search.lookupFields
				
				var updatedWarrantyExpiration = search.lookupFields({
					type: 'customrecord_wrm_warrantyreg',
					id: warrantyInternalId,
					columns: ['custrecord_wrm_reg_warrantyexpire']
				});

				// Log the updated value of 'Warranty Expiration' field
				log.debug('Warranty Expiration Updated', 'Record ID: ' + warrantyInternalId + ', New Value: ' + updatedWarrantyExpiration.custrecord_wrm_reg_warrantyexpire);
            }
        } catch (e) {
            log.error('Error in executeAdditionalSearch', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});