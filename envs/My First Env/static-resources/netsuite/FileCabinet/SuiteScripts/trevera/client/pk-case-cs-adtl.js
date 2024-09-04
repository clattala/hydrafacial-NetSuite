/**
* @NApiVersion 2.0
* @NScriptType ClientScript
*/

/**
 * updates case status field
 */
define([
], function (
) {
    'use strict';
    function pageInit(context) {
        var nsRecord = context.currentRecord;
        var dummyStatus = nsRecord.getValue({ fieldId: 'custpage_case_status' })
        nsRecord.setValue({ fieldId: 'status', value: dummyStatus });
    }

    function fieldChanged(context) {
        var nsRecord = context.currentRecord;
        var fieldId = context.fieldId;
        console.log('fieldChanged:args', { fieldId: fieldId })

        if (
            fieldId === 'custpage_case_status'
        ) {
            var value = nsRecord.getValue({ fieldId: fieldId })
            nsRecord.setValue({ fieldId: 'status', value: value });
        }
    }

    return {
        fieldChanged: fieldChanged,
        pageInit: pageInit
    }
});