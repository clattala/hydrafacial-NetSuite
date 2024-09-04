/**
 * purchaseClient.ts
 * by Trevera, Inc.
 *
 * @NScriptName HF | Purchase | Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "./Utils/treveraUtilsClient"], function (require, exports, treveraUtilsClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateLine = exports.postSourcing = exports.pageInit = void 0;
    function pageInit(context) {
        const currentForm = context.currentRecord.getValue({ fieldId: 'customform' });
        (0, treveraUtilsClient_1.setDefaultReceivingLocation)(currentForm);
        console.log('pageInit');
    }
    exports.pageInit = pageInit;
    function postSourcing(context) {
        if (!context.sublistId && ['location', 'subsidiary'].includes(context.fieldId)) {
            const currentForm = context.currentRecord.getValue({ fieldId: 'customform' });
            (0, treveraUtilsClient_1.setDefaultReceivingLocation)(currentForm);
        }
    }
    exports.postSourcing = postSourcing;
    function validateLine(context) {
        if (context.sublistId == 'item') {
            if (!(0, treveraUtilsClient_1.requireLocationOnLine)(context.currentRecord))
                return false;
        }
        return true;
    }
    exports.validateLine = validateLine;
});
