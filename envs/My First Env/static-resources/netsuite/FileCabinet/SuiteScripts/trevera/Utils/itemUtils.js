/**
 * itemUtils.ts
 * shelby.severin@trevera.com
 *
 * @NScriptName HF | Item Utils
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/query"], function (require, exports, query) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setGLCode = exports.getGLAccounts = exports.searchItemByName = exports._ITEM_GL_ACCOUNTS_FIELDS_NON_IVENTORY = exports._ITEM_GL_ACCOUNTS_FIELDS = exports._ITEM_GL_ACCOUNTS_RECORD = exports._ITEM_FIELD_GROUP = void 0;
    exports._ITEM_FIELD_GROUP = 'custitem_hf_itemgroup';
    exports._ITEM_GL_ACCOUNTS_RECORD = 'customrecorditem_gl_account_default';
    exports._ITEM_GL_ACCOUNTS_FIELDS = {
        assetaccount: 'custrecord_asset_account',
        cogsaccount: 'custrecord_cogs_account',
        itemgroup: 'custrecord_item_group',
        incomeaccount: 'custrecord_revenue_account'
    };
    exports._ITEM_GL_ACCOUNTS_FIELDS_NON_IVENTORY = {
        assetaccount: 'custrecord_asset_account',
        cogsaccount: 'custrecord_cogs_account',
        dropshipexpenseaccount: 'custrecord_expense_account',
        itemgroup: 'custrecord_item_group',
        incomeaccount: 'custrecord_revenue_account'
    };
    function searchItemByName(name, id) {
        if (id) {
            return query.runSuiteQL({
                query: `SELECT id, itemId FROM item WHERE itemId = ? AND id != ?`,
                params: [name, id]
            }).asMappedResults();
        }
        return query.runSuiteQL({
            query: `SELECT id, itemId FROM item WHERE itemId = ? `,
            params: [name]
        }).asMappedResults();
    }
    exports.searchItemByName = searchItemByName;
    function getGLAccounts(itemGroup, itemType) {
        let columnsString = ``;
        if (itemType == 'noninventoryitem') {
            for (const prop in exports._ITEM_GL_ACCOUNTS_FIELDS_NON_IVENTORY) {
                columnsString += `${columnsString.length > 0 ? ',' : ''} ${exports._ITEM_GL_ACCOUNTS_FIELDS_NON_IVENTORY[prop]} as ${prop}`;
            }
        }
        else {
            for (const prop in exports._ITEM_GL_ACCOUNTS_FIELDS) {
                columnsString += `${columnsString.length > 0 ? ',' : ''} ${exports._ITEM_GL_ACCOUNTS_FIELDS[prop]} as ${prop}`;
            }
        }
        return query.runSuiteQL({
            query: `SELECT ${columnsString} FROM ${exports._ITEM_GL_ACCOUNTS_RECORD} WHERE ${exports._ITEM_GL_ACCOUNTS_FIELDS.itemgroup} = ?`,
            params: [itemGroup]
        }).asMappedResults();
    }
    exports.getGLAccounts = getGLAccounts;
    function setGLCode(rec) {
        const itemGroup = rec.getValue(exports._ITEM_FIELD_GROUP);
        if (itemGroup) {
            const glAccountRecord = getGLAccounts(itemGroup, rec.type);
            if (glAccountRecord.length == 1) {
                for (let prop in glAccountRecord[0]) {
                    if (glAccountRecord[0][prop])
                        rec.setValue(prop, glAccountRecord[0][prop]);
                }
            }
        }
    }
    exports.setGLCode = setGLCode;
});
