/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * Sets item gl accounts on the item record when item group field is selected.
 */
define([
    'N/search'
], function (
    search
) {
    'use strict';
    /**
     * @const {Object.<string, Object.<string, string>>}
     */
    const CUSTOM_RECORD = {
        Type: {
            ITEM_GL_ACCOUNTS: 'customrecorditem_gl_account_default'
        }
    };

    /**
     * @const {Object.<string, Object.<string, string>>}
     */
    const ITEM_GL_ACCOUNTS = {
        FIELDS: {
            itemgroup: 'custrecord_item_group'
            , cogsaccount: 'custrecord_cogs_account'
            , incomeaccount: 'custrecord_revenue_account'
            , dropshipexpenseaccount: 'custrecord_expense_account'
            , assetaccount: 'custrecord_asset_account'
            // 'custrecord_variance_account'
        }
    };

    /**
     * returns object containing item accounts defined on a custom record
     * @param {string} itemGroup item group id for custom item group field selected on sales order
     * @returns {{cogsaccount: string, incomeaccount: string, dropshipexpenseaccount: string}}
     */
    const searchItemGLAccounts = (itemGroup, itemType) => {
        try {
            const oItemGLAccounts = {};
            const searchCols = {};
            const arrColFields = [
                'cogsaccount',
                'incomeaccount',
                'assetaccount'
            ];

            if (itemType === 'noninventoryitem') { arrColFields.push('dropshipexpenseaccount') ;}

            arrColFields
                .forEach(function (fieldId) {
                    const name = ITEM_GL_ACCOUNTS.FIELDS[fieldId];
                    searchCols[fieldId] = search.createColumn({ name })
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

    const beforeSubmit = context => {
        try {
            const { type: contextType, newRecord } = context;
            const { type } = newRecord;
            log.debug(`type:`, type)
            const itemGroup = newRecord.getValue({ fieldId: 'custitem_hf_itemgroup' });

            if ([
                context.UserEventType.CREATE,
                context.UserEventType.EDIT
            ].indexOf(contextType) === -1) {
                return;
            }

            log.debug('itemGroup', itemGroup);

            if (itemGroup) {
                const oItemGLAccounts = searchItemGLAccounts(itemGroup, type);
                for (let id in oItemGLAccounts) {
                    if (oItemGLAccounts.hasOwnProperty(id)) {
                        if (oItemGLAccounts[id]) {
                            newRecord.setValue({ fieldId: id, value: oItemGLAccounts[id] });
                        }
                    }
                }
            }

        } catch (E) {
            log.error('trevera-setitemgl-cs:beforeSubmit:Error:', E);
            throw E;
        }
    }

    return { beforeSubmit }
});