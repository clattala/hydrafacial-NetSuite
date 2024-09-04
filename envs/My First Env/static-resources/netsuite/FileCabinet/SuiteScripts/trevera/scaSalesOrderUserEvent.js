/**
 * scaSalesOrderUserEvent.ts
 * by Trevera, Inc.
 *
 * @NScriptName HF | SCA Sales Order
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/runtime", "./Utils/hfTransactionUtils"], function (require, exports, log, runtime, hfTransactionUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    const _ukSubsidiary = 1;
    const _ukSalesOrderForm = 1;
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSTORE) {
            const subsidiary = Number(context.newRecord.getValue('subsidiary'));
            if (_ukSubsidiary == subsidiary)
                context.newRecord.setValue('customform', _ukSalesOrderForm);
            try {
                (0, hfTransactionUtils_1.setStrikethroughPriceOnLines)(context.newRecord);
            }
            catch (e) {
                log.error('error setting up prices', e);
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
});
