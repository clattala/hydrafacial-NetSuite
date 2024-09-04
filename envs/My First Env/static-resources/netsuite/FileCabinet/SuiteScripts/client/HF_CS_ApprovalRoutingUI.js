/**
 *
 * HF_CS_ApprovalRoutingUI.js
 *
 * Description:
 * Includes client-side functionalities and validation for approval routing.
 *
 * Version      Date            Author          Notes
 * 1.0          2021 Jul 01     cfrancisco      Initial version
 *
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], function (CURRENTRECORD) {
    var RECORDMODE = '';


    function saveRecord(context) {
        var currRec = context.currentRecord;

        var bAllow = true;

        switch (currRec.type) {
            case 'journalentry':
            case 'advintercompanyjournalentry':
                bAllow = saveRecord_checkAttachments(currRec, event);
                break;
            default:
        }


        return bAllow;
    }

    function saveRecord_checkAttachments(currRec) {
        var hasCreatedFrom = currRec.getValue({ fieldId: 'createdfrom' });
        if (!!hasCreatedFrom) return true;
        var bHasMedia = (currRec.getLineCount({ sublistId: 'mediaitem' }) > 0);

        if (!bHasMedia && (RECORDMODE == 'copy' || RECORDMODE == 'create')) {
            alert('Please attach at least one file before saving the transaction.');
        } else {
            bHasMedia = true;
        }

        return bHasMedia;
    }


    function pageInit(context) {
        RECORDMODE = context.mode;
        console.log('context', context)
    }


    function validateField(context) {

    }

    function fieldChanged(context) {

    }

    function postSourcing(context) {

    }

    function lineInit(context) {

    }

    function validateDelete(context) {

    }

    function validateInsert(context) {

    }

    function validateLine(context) {

    }

    function sublistChanged(context) {

    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        // validateField: validateField,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});