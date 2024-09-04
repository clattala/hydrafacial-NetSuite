/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/record'], function (search, record) {
    function onAction(scriptContext) {
        var newRecord = scriptContext.newRecord;
        var vendor = newRecord.getValue('custrecord_2663_parent_vendor');
		log.debug('vendor', vendor);
        var customrecord_2663_entity_bank_detailsSearchObj = search.create({
            type: "customrecord_2663_entity_bank_details",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_2663_parent_vendor", "anyof", vendor],
                    "AND",
                    ["custrecord_bank_details_approval_status", "anyof", "2"],
                    "AND",
                    ["custrecord_2663_entity_bank_type", "anyof", "1"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
        });
        var searchResultCount = customrecord_2663_entity_bank_detailsSearchObj.runPaged().count;
      	log.debug('searchResultCount', searchResultCount);
        //if (searchResultCount == 1) {
            deleteVendorBank(vendor);
        //}
        return;
    }
    function deleteVendorBank(vendor) {
        log.debug('deleteVendorBank', vendor);
        var customrecord_fispan_vendor_bank_detailsSearchObj = search.create({
            type: "customrecord_fispan_vendor_bank_details",
            filters:
                [
                    ["custrecord_fispan_vbd_vendor", "anyof", vendor],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = customrecord_fispan_vendor_bank_detailsSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            var recId;
            customrecord_fispan_vendor_bank_detailsSearchObj.run().each(function (result) {
                recId = result.getValue('internalid');
                return false;
            });
            var deleteCustRecord = record.delete({
                type: 'customrecord_fispan_vendor_bank_details',
                id: recId
            });
            log.debug('deleteCustRecord', deleteCustRecord);
        }
    }
    return {
        onAction: onAction
    }
});