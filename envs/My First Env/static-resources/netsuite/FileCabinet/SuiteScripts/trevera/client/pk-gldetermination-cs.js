/**
* @NApiVersion 2.0
* @NScriptType ClientScript
*/

/**
 * Client script on gl determination custom record
 */

define([
    'N/ui/dialog'
    , 'N/ui/message'
    , 'N/search'
], function (
    dialog
    , message
    , search
) {
    'use strict';
    /**
     * @const {Object.<string, Object.<string, string>>}
     */


    function pageInit(context) {
        console.log('trevera-setitemgl-cs: Page Initiated: ', context);
    }

    function saveRecord(context) {
        var rec = context.currentRecord;
        var customer = rec.getValue({ fieldId: 'custrecord4' })
        var salesgroup = rec.getValue({ fieldId: 'custrecord_customer_salesgroup' })

        if (!customer && !salesgroup) {
            dialog.alert({
                title: 'EMPTY_FIELDS_ALERT'
                , message: 'You must select one of the options: Customer or SalesGroup'
            })
            return false;
        }

        return true;
    }

    function fieldChanged(context) {
        try {
            var fieldId = context.fieldId;
            var rec = context.currentRecord;
            var customer = rec.getValue({ fieldId: 'custrecord4' })

            if (fieldId === 'custrecord4') {

                var customerfields = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customer,
                    columns: ['custentity_hf_salesgroup']
                })
                //{custentity_hf_salesgroup: Array(1)}

                if (
                    customerfields.hasOwnProperty('custentity_hf_salesgroup') &&
                    customerfields.custentity_hf_salesgroup.length > 0
                ) {
                    var salesgrp = customerfields.custentity_hf_salesgroup[0];
                    rec.setValue({ fieldId: 'custrecord_customer_salesgroup', value: salesgrp.value })
                }

            }


        } catch (E) {

        }
    }

    return {
        pageInit: pageInit
        , saveRecord: saveRecord
        , fieldChanged: fieldChanged
    }
});