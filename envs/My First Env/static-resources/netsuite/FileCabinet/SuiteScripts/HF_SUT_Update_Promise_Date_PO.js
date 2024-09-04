/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/format'],

    function (record, serverWidget,format) {

        // Define the Suitelet script functions
        function onRequest(context) {
            // Check if the request method is GET
            if (context.request.method === 'GET') {
                // Get the record ID from the request parameter
                var recordId = context.request.parameters.po_id;

                // Load the purchase order record
                var purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: recordId
                });

                // Get the values of the purchase order number and the items
                var purchaseOrderNumber = purchaseOrder.getValue({
                    fieldId: 'tranid'
                });
                // var items = purchaseOrder.getSublist({
                    // sublistId: 'item'
                // });
				var itemCount = purchaseOrder.getLineCount({
                    sublistId: 'item'
                });
                // Create a form using the serverWidget module
                var form = serverWidget.createForm({
                    title: 'Update Latest Promise Date'
                });

                // Add a field to display the purchase order number
                var purchaseOrderNumberField = form.addField({
                    id: 'custpage_purchase_order_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Purchase Order Number'
                });
                purchaseOrderNumberField.defaultValue = purchaseOrderNumber;
                purchaseOrderNumberField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
				var poIdField = form.addField({
				   id: 'custpage_po_id',
				   type: serverWidget.FieldType.TEXT,
				   label: 'PO ID'
				});

				poIdField.defaultValue = recordId;
				
				// Hide the field
				poIdField.updateDisplayType({
				   displayType: serverWidget.FieldDisplayType.HIDDEN
				});

                // Add a sublist to display the items
                var itemList = form.addSublist({
                    id: 'custpage_item_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'Items'
                });
                itemList.addField({
                    id: 'custpage_item_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name',
					isDisabled:true
                });
                itemList.addField({
                    id: 'custpage_item_quantity',
                    type: serverWidget.FieldType.FLOAT,
                    label: 'Quantity'
                });
                itemList.addField({
                    id: 'custpage_item_rate',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Rate'
                });
                itemList.addField({
                    id: 'custpage_item_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount'
                });
                // Add a column for the latest promise date in the sublist
                itemList.addField({
                    id: 'custpage_latest_promise_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Latest Promise Date'
                }).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});

                // Loop through the items and add them to the sublist
                // var itemCount = items.getLineCount();
				log.debug('itemCount',itemCount);
				var parsedDate;
                for (var i = 0; i < itemCount; i++) {
                    var itemName = purchaseOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
					log.debug('Item',itemName);
                    var itemQuantity = purchaseOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    var itemRate = purchaseOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });
                    var itemAmount = purchaseOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    });
                    // Get the value of the latest promise date field from the record
                    var latestPromiseDate = purchaseOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_hf_original_promise_date', // Use the line level field ID
                        line: i
                    });
					log.debug('latestPromiseDate',latestPromiseDate);
                    itemList.setSublistValue({
                        id: 'custpage_item_name',
                        line: i,
                        value: itemName
                    });
                    itemList.setSublistValue({
                        id: 'custpage_item_quantity',
                        line: i,
                        value: itemQuantity
                    });
                    itemList.setSublistValue({
                        id: 'custpage_item_rate',
                        line: i,
                        value: itemRate
                    });
                    itemList.setSublistValue({
                        id: 'custpage_item_amount',
                        line: i,
                        value: itemAmount
                    });
                    // Set the value of the latest promise date field in the sublist
					if (latestPromiseDate !== null && latestPromiseDate !== '') {
					parsedDate = format.format({
						value: latestPromiseDate,
						type: format.Type.DATE
					});
					log.debug(parsedDate);
                    itemList.setSublistValue({
                        id: 'custpage_latest_promise_date',
                        line: i,
                        value: parsedDate
                    });
					}
                }

                // Add a submit button to the form
                form.addSubmitButton({
                    label: 'Submit'
                });

                // Return the form as the response of the Suitelet
                context.response.writePage(form);

            }

            // Check if the request method is POST
            if (context.request.method === 'POST') {
                // Get the record ID from the request parameter
                var recordId = context.request.parameters.custpage_po_id;
				log.debug('recordid in Post',recordId);
                // Load the purchase order record
                var purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: recordId
                });

                // Get the number of items in the purchase order
                var itemCount = purchaseOrder.getLineCount({
                    sublistId: 'item'
                });
				var parsedDate;
                // Loop through the items and update the latest promise date field in the record
                for (var i = 0; i < itemCount; i++) {
                    // Get the latest promise date from the request parameter
                    var latestPromiseDate = context.request.getSublistValue({
                        group: 'custpage_item_list',
                        name: 'custpage_latest_promise_date',
                        line: i
                    });
					parsedDate = format.parse({value: latestPromiseDate, type: format.Type.DATE});
                    // Set the value of the latest promise date field in the record
                    purchaseOrder.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_hf_original_promise_date', // Use the line level field ID
                        line: i,
                        value: parsedDate
                    });
                }

                // Save the purchase order record
                purchaseOrder.save();

                // Redirect the user back to the purchase order record page
                context.response.sendRedirect({
                    type: 'RECORD',
                    identifier: record.Type.PURCHASE_ORDER,
                    id: recordId
                });
            }
        }

        // Return the Suitelet script functions
        return {
            onRequest: onRequest
        };
    });
