/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
=========================================================================================================================
Date          Version     Created/Modified By  Change History
=========================================================================================================================
08/01/2024    1.0         HD                   CHN-606-Transfer Order Loaner Automation. This script creates/updates warranty registration when devices are shipped out/returned.
=========================================================================================================================
 */
define(['N/record', 'N/search', 'N/log', 'N/format'], function(record, search, log, format) {

    function afterSubmit(context) {
        // Check if the event is CREATE or EDIT
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
            return;
        }

        var itemReceipt = context.newRecord;

        // Get the ID of the transaction from which this Item Receipt was created
        var createdFromId = itemReceipt.getValue({ fieldId: 'createdfrom' });
        if (!createdFromId) {
            return;
        }

        log.debug({
            title: 'Created From Transaction ID',
            details: 'createdFromId: ' + createdFromId
        });

        // Verify if the created from transaction is a Transfer Order
        var createdFromType = search.lookupFields({
            type: 'transaction',
            id: createdFromId,
            columns: ['recordtype']
        }).recordtype;

        log.debug({
            title: 'Created From Transaction Type',
            details: 'createdFromType: ' + createdFromType
        });

        if (createdFromType !== 'transferorder') {
            return;
        }

        // Load the Transfer Order record
        var transferOrder = record.load({
            type: record.Type.TRANSFER_ORDER,
            id: createdFromId
        });

        // Retrieve custom fields 'Transfer Type' and 'Return Date' from the Transfer Order
        var transferType = transferOrder.getValue({ fieldId: 'custbody_hf_transfer_type' });
        var transferTypeText = transferOrder.getText({ fieldId: 'custbody_hf_transfer_type' });
        var returnDate = transferOrder.getValue({ fieldId: 'custbody_hf_return_date' });

        log.debug({
            title: 'Transfer Type and Return Date',
            details: 'transferType: ' + transferType + ', transferTypeText: ' + transferTypeText + ', returnDate: ' + returnDate
        });

        // Handle 'Equipment Return' case
        if (transferTypeText === 'Equipment Return') {
            log.debug({
                title: 'Equipment Return Logic',
                details: 'Processing Equipment Return logic'
            });

            // Process Equipment Return Logic
            handleEquipmentReturn(itemReceipt);
            return;
        }

        // Only proceed if Transfer Type text matches specific values and Return Date is available
        var validTransferTypes = ['Customer Trial', 'Internal Request(Sales Rep/Edge Accounts)', 'Warranty Loaner'];
        if (!returnDate || validTransferTypes.indexOf(transferTypeText) === -1) {
            return;
        }

        var numLines = itemReceipt.getLineCount({ sublistId: 'item' });

        // Get today's date and set the warranty expiration date to today's date -1
        var today = new Date();
        today.setDate(today.getDate() - 1);
        var warrantyExpirationDate = format.parse({
            value: today,
            type: format.Type.DATE
        });

        log.debug({
            title: 'Parsed Warranty Expiration Date',
            details: 'warrantyExpirationDate: ' + warrantyExpirationDate
        });

        // Get the document number of the Item Receipt
		var tranid = search.lookupFields({
            type: context.newRecord.type,
            id: context.newRecord.id,
            columns: ['tranid']
            }).tranid
        // var itemReceiptDocNum = itemReceipt.getValue({ fieldId: 'tranid' });


        // log.debug({
            // title: 'Item Receipt Document Number',
            // details: 'itemReceiptDocNum: ' + itemReceiptDocNum
        // });

        log.debug({
            title: 'Item Receipt Document Number',
            details: 'itemReceiptDocNum: ' + tranid
        });

        // Loop through each line in the item sublist
        for (var i = 0; i < numLines; i++) {
            // Create a new Warranty Registration record for each line item
            var warrantyRegistration = record.create({
                type: 'customrecord_wrm_warrantyreg',
                isDynamic: true
            });

            // Set values for the Warranty Registration record
            warrantyRegistration.setValue({
                fieldId: 'custrecord_hf_transfer_type',
                value: transferType
            });

            warrantyRegistration.setValue({
                fieldId: 'custrecord_hf_return_date',
                value: returnDate
            });

            warrantyRegistration.setValue({
                fieldId: 'custrecord_wrm_reg_customer',
                value: transferOrder.getValue({ fieldId: 'custbody_hf_transfer_customer' })
            });

            // Get item details from the current line
            var itemId = itemReceipt.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            log.debug({
                title: 'Item',
                details: 'Item: ' + itemId
            });

            var quantity = itemReceipt.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });

            log.debug({
                title: 'Quantity',
                details: 'Quantity: ' + quantity
            });

            warrantyRegistration.setValue({
                fieldId: 'custrecord_wrm_reg_item',
                value: itemId
            });

            warrantyRegistration.setValue({
                fieldId: 'custrecord_wrm_reg_quantity',
                value: quantity
            });

            // Handle serialized items
            var inventoryDetailSubrecord = itemReceipt.getSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail',
                line: i
            });

            var serialNumbers = [];
            if (inventoryDetailSubrecord) {
                var numInventoryDetails = inventoryDetailSubrecord.getLineCount({ sublistId: 'inventoryassignment' });

                for (var j = 0; j < numInventoryDetails; j++) {
                    var serialNumber = inventoryDetailSubrecord.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'receiptinventorynumber',
                        line: j
                    });
                    serialNumbers.push(serialNumber);
                }

                // Set the serial numbers in the custom field
                warrantyRegistration.setValue({
                    fieldId: 'custrecord_wrm_reg_ref_seriallot',
                    value: serialNumbers.join(', ')
                });
            }

            log.debug({
                title: 'SerialNumbers',
                details: 'SerialNumbers: ' + serialNumbers
            });

            // Set the warranty expiration date
            warrantyRegistration.setValue({
                fieldId: 'custrecord_wrm_reg_warrantybegin',
                value: warrantyExpirationDate
            });

            warrantyRegistration.setValue({
                fieldId: 'custrecord_wrm_reg_warrantyexpire',
                value: warrantyExpirationDate
            });

            // Log the details before saving the Warranty Registration
            log.debug({
                title: 'Warranty Registration Details',
                details: 'Line: ' + i + ', transferType: ' + transferType + ', returnDate: ' + returnDate + ', itemId: ' + itemId + ', quantity: ' + quantity + ', serialNumbers: ' + serialNumbers.join(', ') + ', warrantyExpirationDate: ' + warrantyExpirationDate
            });

            // Save the Warranty Registration record
            var warrantyId = warrantyRegistration.save();

            // Additional Logic for Registration No. and Reference Invoice
            var registrationNo = warrantyId + format.format({
                value: today,
                type: format.Type.DATE
            }).replace(/\//g, ''); // Format today's date without slashes

            record.submitFields({
                type: 'customrecord_wrm_warrantyreg',
                id: warrantyId,
                values: {
                    'custrecord_wrm_reg_registration': registrationNo,
                    'custrecord_wrm_reg_ref_invoice': tranid
                }
            });

            // Log successful creation of the Warranty Registration record
            log.debug({
                title: 'Warranty Registration Created',
                details: 'Warranty registration record created successfully for Transfer Order ID: ' + createdFromId + '. Warranty ID: ' + warrantyId + ', Line: ' + i + ', Registration No: ' + registrationNo + ', Item Receipt No: ' + tranid
            });
        }
    }

    function handleEquipmentReturn(itemReceipt) {
        var numLines = itemReceipt.getLineCount({ sublistId: 'item' });

        for (var i = 0; i < numLines; i++) {
            var itemId = itemReceipt.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            var inventoryDetailSubrecord = itemReceipt.getSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail',
                line: i
            });

            if (inventoryDetailSubrecord) {
                var numInventoryDetails = inventoryDetailSubrecord.getLineCount({ sublistId: 'inventoryassignment' });

                for (var j = 0; j < numInventoryDetails; j++) {
                    var serialNumber = inventoryDetailSubrecord.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'receiptinventorynumber',
                        line: j
                    });

                    if (serialNumber) {
                        var serialNumberRecordId = getSerialNumberRecordId(serialNumber, itemId);
                        if (serialNumberRecordId) {
                            // Find and deactivate the corresponding Warranty Registration record
                            deactivateWarrantyRegistration(serialNumberRecordId);
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

    function getSerialNumberRecordId(serialNumber, itemId) {
        var searchResults = search.create({
            type: 'customrecord_wrm_warrantyreg',
            filters: [
                ['custrecord_wrm_reg_item', 'anyof', itemId],
                'AND',
                ['custrecord_wrm_reg_ref_seriallot', 'contains', serialNumber],
                'AND',
                ['isinactive', 'is', 'F']
            ],
            columns: ['internalid']
        }).run().getRange({ start: 0, end: 1 });

        return searchResults.length > 0 ? searchResults[0].getValue('internalid') : null;
    }

    function deactivateWarrantyRegistration(recordId) {
        record.submitFields({
            type: 'customrecord_wrm_warrantyreg',
            id: recordId,
            values: {
                'isinactive': true
            }
        });

        log.debug({
            title: 'Warranty Registration Deactivated',
            details: 'Warranty registration record ID: ' + recordId + ' has been deactivated.'
        });
    }

    return {
        afterSubmit: afterSubmit
    };
});