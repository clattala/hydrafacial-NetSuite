/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search'], function(record, search) {

    function onAction(scriptContext) {
        // Get the current record in the workflow
        var requisition = scriptContext.newRecord;
        // Transform the requisition to purchase order
        var purchaseOrder = record.transform({
            fromType: record.Type.PURCHASE_REQUISITION,
            fromId: requisition.id,
            toType: record.Type.PURCHASE_ORDER,
            isDynamic: true,
            enableSourcing: true // Enable sourcing on purchase order
        });
        // Set fields
        purchaseOrder.setValue({
            fieldId: 'customform',
            value: '511'     //HF | Requisition| Purchase Order
        });
        purchaseOrder.setValue({
            fieldId: 'approvalstatus',
            value: '2'      //Approved
        });
      	purchaseOrder.setValue({
            fieldId: 'location',
            value: '30'      //Receiving Warehouse
        });
        purchaseOrder.setValue({
            fieldId: 'custbody_hf_created_from_requisition',
            value: requisition.id
        });
        purchaseOrder.setValue({
            fieldId: 'custbody_hf_buyer',
            value: requisition.getValue('custbody_hf_on_behalf_of')
        });
        purchaseOrder.setValue({
            fieldId: 'custbody_hf_po_creator',
            value: requisition.getValue('custbody_hf_po_creator')
        });
        // Load the saved search by its internal id
        var vendorSearch = search.load({
            id: 'customsearch_vendor_def_billing_address'
        });
        // Get the vendor internal id from the purchase order record
        var vendorId = purchaseOrder.getValue('entity');
		// Create a filter object
		var filter = search.createFilter({
			name: 'internalid',
			operator: search.Operator.ANYOF,
			values: [vendorId]
		});

		// Set the filters as the filter object
		vendorSearch.filters = filter;

        // Execute the saved search and get the result set
        var vendorResults = vendorSearch.run().getRange({
            start: 0,
            end: 1 // assuming there is only one result
        });
		log.debug('Vendor Search Results', JSON.stringify(vendorResults));

        // Get the address internal id and the terms from the result set
		// Get the vendor result
		var vendorResult = vendorResults[0];
		var values = vendorResult.getAllValues();
		var addressId = values['billingAddress.addressinternalid'];
		log.debug('Billing Address Internal ID: ', addressId);

        var terms = vendorResults[0].getValue({
            name: 'terms'
        });
        // Set the billaddress field from the address internal id
        purchaseOrder.setValue({
            fieldId: 'billaddresslist',
            value: addressId
        });
        // Set the Terms field from the terms
        purchaseOrder.setValue({
            fieldId: 'terms',
            value: terms
        });
        // Save the purchase order record
        var poId = purchaseOrder.save();
    }

    return {
        onAction: onAction
    };
});
