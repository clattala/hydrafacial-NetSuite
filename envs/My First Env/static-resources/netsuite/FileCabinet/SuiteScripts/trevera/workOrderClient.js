/**
 * workOrderClient.ts
 * by Trevera, Inc.
 *
 * @NScriptName Work Order - Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["./Utils/treveraUtilsClient"], function (treveraUtilsClient_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateDelete = exports.validateLine = exports.postSourcing = exports.sublistChanged = exports.pageInit = exports.ITEM_LOCATIONS = exports.ITEMS = void 0;
    exports.ITEMS = [];
    exports.ITEM_LOCATIONS = [];
    function pageInit(context) {
        if (context.currentRecord.getValue({ fieldId: 'subsidiary' }) != '') {
            treveraUtilsClient_1.getDefaultLocationForSubsidiary();
        }
    }
    exports.pageInit = pageInit;
    function sublistChanged(context) {
        if (context.sublistId === 'item') {
            for (var i = 0; i < context.currentRecord.getLineCount({ sublistId: 'item' }); i++) {
                exports.ITEMS[i] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                exports.ITEM_LOCATIONS[i] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i });
            }
        }
    }
    exports.sublistChanged = sublistChanged;
    function postSourcing(context) {
        if (context.fieldId == 'location' && !context.sublistId) {
            treveraUtilsClient_1.getDefaultLocationForSubsidiary();
        }
        if (context.fieldId == 'item' && context.sublistId == 'item') {
            treveraUtilsClient_1.setLineLocationFromHeader(exports.ITEMS, false);
        }
    }
    exports.postSourcing = postSourcing;
    function validateLine(context) {
        if (context.sublistId == 'item') {
            if (!treveraUtilsClient_1.requireLocationOnLine(context.currentRecord))
                return false;
        }
        return true;
    }
    exports.validateLine = validateLine;
    function validateDelete(context) {
        if (context.sublistId == 'item') {
            for (var i = 0; i < context.currentRecord.getLineCount({ sublistId: 'item' }); i++) {
                exports.ITEMS[i] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                exports.ITEM_LOCATIONS[i] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i });
            }
        }
        return true;
    }
    exports.validateDelete = validateDelete;
    return exports;
});
