/**
 * loyaltyPointsUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty | Points UE
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/runtime", "./loyaltyGlobals"], function (require, exports, log, runtime, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    function afterSubmit(context) {
        log.debug(`afterSubmit context.newRecord.type ${context.newRecord.type}`, `context ${context.type} runtime context ${runtime.executionContext} ${context.newRecord.id}`);
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            // get the customer from the current record being created
            const customer = context.newRecord.getValue('custrecord_hf_loyalty_customer');
            const command = Number(context.newRecord.getValue('custrecord_hf_loyalty_action'));
            const commands = runtime.accountId == '6248126_SB2' ? [loyaltyGlobals_1.commandIdsSBX.correction, loyaltyGlobals_1.commandIdsSBX.bonusPoints, loyaltyGlobals_1.commandIdsSBX.allowance] : [loyaltyGlobals_1.commandIds.correction, loyaltyGlobals_1.commandIds.bonusPoints, loyaltyGlobals_1.commandIds.allowance];
            if (commands.includes(command)) {
                // update the points on the customer
                const latestPoints = (0, loyaltyGlobals_1.getLatestPointsEntry)(customer);
                log.debug(`running update on customer ${customer}`, `points to update: ${latestPoints} for command id ${command}`);
                (0, loyaltyGlobals_1.updatePointsOnCustomer)(customer, latestPoints);
            }
        }
    }
    exports.afterSubmit = afterSubmit;
});
