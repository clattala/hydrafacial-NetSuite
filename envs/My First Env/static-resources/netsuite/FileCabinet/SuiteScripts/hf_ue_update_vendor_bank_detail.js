/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {
    function afterSubmit(context) {
        var bankRecord = context.newRecord;
        var oldBankRecord = context.oldRecord;
        if (context.type == context.UserEventType.DELETE) {
          	var bankType = bankRecord.getValue('custrecord_2663_entity_bank_type');
            var approvalStatus = bankRecord.getValue('custrecord_bank_details_approval_status');
            var inactive = bankRecord.getValue('isinactive');
            if (bankType == 1 && approvalStatus == 2) {
                var vendor = bankRecord.getValue('custrecord_2663_parent_vendor');
                deleteVendorBank(vendor);
            }
        }
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
        afterSubmit: afterSubmit
    };
});