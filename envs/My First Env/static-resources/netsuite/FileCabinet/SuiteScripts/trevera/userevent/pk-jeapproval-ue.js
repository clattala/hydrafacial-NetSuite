/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define([
    'N/search'
    , 'N/record'
    , 'N/ui/message'
    , 'N/ui/dialog'
], function (
    search
    , record
    , message
    , dialog
) {
    'use strict';

    function srchFiles(id) {
        let filePresent = false;
        const searchCols = {
            fileIdMax: search
                .createColumn({
                    name: "internalid",
                    join: "file",
                    summary: "MAX",
                    sort: search.Sort.ASC
                })
            , docnumber: search
                .createColumn({
                    name: "tranid",
                    summary: "GROUP",
                })
        }

        search
            .create({
                type: "transaction",
                filters:
                    [
                        /*["approvalstatus", "anyof", "1"],
                        "AND",
                        ["status", "noneof", "Journal:B"],
                        "AND",*/
                        ["internalid", "anyof", id]
                    ],
                columns:
                    [
                        searchCols.fileIdMax, searchCols.docnumber
                    ]
            }).run()
            .each(function (result) {
                filePresent = Boolean(Number(result.getValue(searchCols.fileIdMax)))
                return true;
            });

        return filePresent;
    }

    function beforeLoad(context) {
        const { form, newRecord } = context;
		if(!Number(newRecord.id)) return;
        switch (newRecord.type) {
            case record.Type.INTER_COMPANY_JOURNAL_ENTRY:
            case record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY:
            case record.Type.JOURNAL_ENTRY:
                if (!srchFiles(newRecord.id)) {
                    form
                        .addPageInitMessage({
                            type: message.Type.WARNING
                            , title: 'FILES ABSENT'
                            , message: 'Please edit and select the file to see Submit for Approval'
                        });
                }
                break;
            default:
                break;
        }
    }

    function checkAttachments(currRec) {
        var hasCreatedFrom = currRec.getValue({ fieldId: 'createdfrom' });
        if (!!hasCreatedFrom) return true;
        var bHasMedia = (currRec.getLineCount({ sublistId: 'mediaitem' }) > 0);
        return bHasMedia;
    }

    function beforeSubmit(context) {
        const { form, newRecord } = context;
        if (!checkAttachments(newRecord)) {
            throw new Error(`Please edit and select the file to see Submit for Approval`)
        }
    }

    return {
        beforeLoad
        //, beforeSubmit
    }
});