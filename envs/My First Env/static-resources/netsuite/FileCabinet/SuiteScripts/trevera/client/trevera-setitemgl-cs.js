/**
* @NApiVersion 2.0
* @NScriptType ClientScript
*/

/**
 * Client script for setting accounts on item record
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
    var CUSTOM_RECORD = {
        Type: {
            ITEM_GL_ACCOUNTS: 'customrecorditem_gl_account_default'
        }
    };

    /**
     * @const {Object.<string, Object.<string, string>>}
     */
    var ITEM_GL_ACCOUNTS = {
        FIELDS: {
            itemgroup: 'custrecord_item_group'
            , cogsaccount: 'custrecord_cogs_account'
            , incomeaccount: 'custrecord_revenue_account'
            , expenseaccount: 'custrecord_expense_account'
          	, assetaccount: 'custrecord_asset_account'
            // 'custrecord_variance_account'
        }
    };

    /**
     * runs different operations on field changed event
     * @param {Object} context script context object
     * @returns {null}
     */
    function fieldChanged(context) {
        try {
            var nsRecord = context.currentRecord;
            var sublistId = context.sublistId;
            var fieldId = context.fieldId;
            var line = context.line;
            var fieldValue = nsRecord.getValue({ fieldId: fieldId });
            console.log('fieldChanged:args', { sublistId: sublistId, fieldId: fieldId, line: line, fieldValue: fieldValue })

            if (fieldId === "custitem_hf_itemgroup" && fieldValue) {
                var oItemGLAccounts = searchItemGLAccounts(fieldValue);
                for (var id in oItemGLAccounts) {
                    if (oItemGLAccounts.hasOwnProperty(id)) {
                        nsRecord.setValue({ fieldId: id, value: oItemGLAccounts[id] });
                    }
                }
            }

        } catch (E) {
            log.error('fieldChanged:Error:', E);
            console.error('fieldChanged:Error: ', E);
        }
    }

    /**
     * returns object containing item accounts defined on a custom record
     * @param {string} itemGroup item group id for custom item group field selected on sales order
     * @returns {{cogsaccount: string, incomeaccount: string, dropshipexpenseaccount: string}}
     */
    function searchItemGLAccounts(itemGroup) {
        try {
            var oItemGLAccounts = {};
            var searchCols = {};
            var arrColFields = [
                'cogsaccount',
                'incomeaccount',
                'expenseaccount',
                'assetaccount'
            ];

            arrColFields
                .forEach(function (fieldId) {
                    searchCols[fieldId] = search.createColumn({ name: ITEM_GL_ACCOUNTS.FIELDS[fieldId] })
                })

            search
                .create({
                    type: CUSTOM_RECORD.Type.ITEM_GL_ACCOUNTS,
                    filters: [
                        [ITEM_GL_ACCOUNTS.FIELDS.itemgroup, "anyof", itemGroup]
                    ],
                    columns: arrColFields.map(function (fieldId) { return searchCols[fieldId]; })
                })
                .run()
                .each(function (result) {
                    arrColFields
                        .forEach(function (fieldId) {
                            oItemGLAccounts[fieldId] = result.getValue(searchCols[fieldId]);
                        });

                    return false;
                });

            log.debug('oItemGLAccounts:', JSON.stringify(oItemGLAccounts));
            return oItemGLAccounts;

        } catch (E) {
            log.error('searchItemGLAccount:Error:', E);
            throw E;
        }
    }

    function pageInit(context) {
        console.log('trevera-setitemgl-cs: Page Initiated: ', context);
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    }
});