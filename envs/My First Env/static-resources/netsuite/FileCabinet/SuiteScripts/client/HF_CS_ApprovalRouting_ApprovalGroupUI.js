/**
 *
 * HF_CS_ApprovalRouting_ApprovalGroupUI.js
 *
 * Description:
 * Contains basic UI validations for the Approval Group record
 *
 * Version      Date            Author          Notes
 * 1.0          2021 Jul 11     cfrancisco      Initial version
 *
 *
 */

/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */
define(['../library/HF_LIB_GeneralHelpers', '../library/HF_LIB_ApprovalRouting'], function(LIB_GENHELPERS, LIB_APPROVALROUTING) {

    var HELPERS = LIB_GENHELPERS.INITIALIZE();
    var _RECORDS = LIB_APPROVALROUTING._RECORDS, _HELPERS = LIB_APPROVALROUTING._HELPERS;
    var APP_ROUTING_HELPERS = _HELPERS;

    function saveRecord (context) {
        var currRec = context.currentRecord;

        var subsidiary = currRec.getValue({ fieldId: _RECORDS.APPROVAL_GROUP.FIELDS.subsidiary }); // Multi-select field fails to evaluate to array
        var requestors = currRec.getValue({ fieldId: _RECORDS.APPROVAL_GROUP.FIELDS.requestors }); // Multi-select field fails to evaluate to array

        if ((HELPERS.isEmpty(subsidiary) || subsidiary == '') && (HELPERS.isEmpty(requestors) || requestors == ''))  {
            alert('Please select either a subsidiary or requestors to save the record.');
            return false;
        }


        return true;
    }



    return {
        saveRecord: saveRecord,
    }
});
