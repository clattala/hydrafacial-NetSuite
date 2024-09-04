/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript

 ****************
 * CHN - 534
 * Hemang Dave
 ****************
 
 */
define(['N/record', 'N/search', 'N/runtime', 'N/log'], function(record, search, runtime, log) {

    function afterSubmit(context) {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            var creditMemoId = context.newRecord.id;
            var creditMemo = record.load({
                type: 'creditmemo',
                id: creditMemoId,
                isDynamic: false
            });
            var lineCount = creditMemo.getLineCount({ sublistId: 'item' });

            for (var i = 0; i < lineCount; i++) {
				var itemId = creditMemo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                var serialNumber = creditMemo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_hf_serialno',
                    line: i
                });

                if (!serialNumber) { // if not found on line, check subrecord
                    var lineSubrecord = creditMemo.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });
                    var numDetailLines = lineSubrecord.getLineCount({
                        sublistId: 'inventoryassignment'
                    });
                    log.debug('Line Count of Subrecord', numDetailLines);

                    for (var j = 0; j < numDetailLines; j++) {
                        serialNumber = lineSubrecord.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'receiptinventorynumber',
                            line: j
                        });

                        log.debug({
                            title: 'Serial Number',
                            details: serialNumber
                        });

                        if (serialNumber) {
                            var serialNumberRecordId = getSerialNumberRecordId(serialNumber, itemId);
                            if (serialNumberRecordId) {
                                processSerialNumber(serialNumberRecordId, serialNumber, itemId, creditMemo);
                            } else {
                                log.error({
                                    title: 'No Warranty Registration Record Found',
                                    details: 'No warranty registration record found for serial number: ' + serialNumber
                                });
                            }
                        }
                    }
                } else {
                    log.debug('Serial Numbers', serialNumber);
                    if (serialNumber) {
                        var serialNumberRecordId = getSerialNumberRecordId(serialNumber, itemId);
                        if (serialNumberRecordId) {
                            processSerialNumber(serialNumberRecordId, serialNumber, itemId, creditMemo);
                        } else {
                            log.error({
                                title: 'No Warranty Registration Record Found',
                                details: 'No warranty registration record found for serial number: ' + serialNumber
                            });
                        }
                    }
                }
            }
        }
    }

    function processSerialNumber(serialNumberRecordId, serialNumber, itemId, creditMemo) {
        //log.debug('serialNumberRecordId', serialNumberRecordId);
        log.debug('serialNumber', serialNumber);
		log.debug('Item ID', itemId);

        var warrantySearch = search.load({
            id: 'customsearch_active_warranties'
        });

		var itemFilters = [
		['custrecord_wrm_reg_item', search.Operator.ANYOF, [itemId]]
		];
		log.debug('itemFilters', itemFilters);
		
        var newFilters = [
            ['custrecord_wrm_reg_serialnumber', search.Operator.ANYOF, [serialNumberRecordId]],
            'OR',
            ['custrecord_wrm_reg_ref_seriallot', search.Operator.IS, [serialNumber]]
        ];

		log.debug('newFilters', newFilters);
		
		// Extract the existing filter expression or create a default one if none exists
		var existingFilterExpression = warrantySearch.filterExpression || [];
		log.debug('existingFilterExpression', existingFilterExpression);

		// Combine the existing filter expression with the new filters using an 'AND' logic
		if (existingFilterExpression.length > 0) {
			warrantySearch.filterExpression = [
				existingFilterExpression,
				"and",
				[itemFilters],
				"and",
				[newFilters]
			];
		} else {
			warrantySearch.filterExpression = [newFilters];
		}
		log.debug('warrantySearch.filterExpression', warrantySearch.filterExpression);
		
        warrantySearch.run().each(function(result) {
            var warrantyId = result.id;
            log.debug('Warranty Id', warrantyId);
            var creditMemoDate = creditMemo.getValue({ fieldId: 'trandate' });
            var expiryDate = getAdjustedExpiryDate(creditMemoDate);

           record.submitFields({
                type: 'customrecord_wrm_warrantyreg',
                id: warrantyId,
                values: {
                    custrecord_wrm_reg_warrantyexpire: creditMemoDate,
                    isinactive: true,
                    custrecord_hf_credit_memo_no: creditMemo.id
                }
            });
            return false; // Stop after the first match
        });
    }

    function getAdjustedExpiryDate(creditMemoDate) {
        var expiryDate = new Date(creditMemoDate);

        // If the credit memo date is today, add 1 day to the expiry date
        if (expiryDate.toDateString() === new Date().toDateString()) {
            expiryDate.setDate(expiryDate.getDate() + 1);
        }

        return expiryDate;
    }

    function getSerialNumberRecordId(serialNumber, itemId) {
        // Perform a search to find the record
        var serialNumberSearch = search.create({
            type: 'inventorynumber',
            filters: [
                ['inventorynumber', search.Operator.IS, serialNumber],
                'AND',
                ['item', search.Operator.ANYOF, [itemId]]
            ],
            columns: ['internalid']
        });

        var serialNumberRecordId = null;
        serialNumberSearch.run().each(function(result) {
            serialNumberRecordId = result.getValue({ name: 'internalid' });
            return false; // Stop after the first match
        });

        log.debug('Serials Internal Id', serialNumberRecordId);
        return serialNumberRecordId;
    }

    return {
        afterSubmit: afterSubmit
    };
});