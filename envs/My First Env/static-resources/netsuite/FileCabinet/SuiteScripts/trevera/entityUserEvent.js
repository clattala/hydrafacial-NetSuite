/**
 * entityUserEvent.ts
 * by Trevera, Inc.
 *
 * @NScriptName HF | Entity | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["N/log"], function (log) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        var balance = Number(context.newRecord.getValue({ fieldId: 'balance' }));
        var creditLimit = context.newRecord.getValue({ fieldId: 'creditlimit' });
        var unbilledOrders = context.newRecord.getValue({ fieldId: 'unbilledorders' });
        var creditholdOverride = context.newRecord.getValue({ fieldId: 'creditholdoverride' });
        var daysOverdue = Number(context.newRecord.getValue({ fieldId: 'daysoverdue' }));
        var overdueBalance = creditLimit - balance - unbilledOrders;
        log.audit("daysOverdue: " + daysOverdue, "overdueBalance: " + overdueBalance + " creditholdOverride: " + creditholdOverride);
        if (daysOverdue >= 90) {
            context.newRecord.setValue({ fieldId: 'custentity_hf_customer_credit_locked', value: true });
        }
        else if (creditLimit > 0 && overdueBalance < 0 || creditholdOverride == 'ON') {
            context.newRecord.setValue({ fieldId: 'custentity_hf_customer_credit_locked', value: true });
        }
        else {
            context.newRecord.setValue({ fieldId: 'custentity_hf_customer_credit_locked', value: false });
        }
    }
    exports.beforeSubmit = beforeSubmit;
    return exports;
});
