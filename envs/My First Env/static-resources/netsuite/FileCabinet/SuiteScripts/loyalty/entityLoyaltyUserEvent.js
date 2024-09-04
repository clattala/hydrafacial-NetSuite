/**
 * entityLoyaltyUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty | Entity User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "./loyaltyGlobals", "N/runtime"], function (require, exports, loyaltyGlobals_1, runtime) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = exports.beforeLoad = void 0;
    function beforeLoad(context) {
        if (context.type == context.UserEventType.COPY) {
            const fieldsToClear = ['custentity_hf_avail_loyalty_points', 'custentity_hf_total_loyalty_points'];
            for (let fieldId of fieldsToClear) {
                context.newRecord.setValue({ fieldId, value: 0 });
            }
            context.newRecord.setValue({ fieldId: 'custentity_hf_current_loyalty_tier', value: '' });
            context.newRecord.setValue({ fieldId: 'custentity_hf_loyalty_optin', value: false });
        }
        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
            context.form.clientScriptModulePath = './entityLoyaltyClient.js';
            context.form.addButton({ id: 'custpage_reclculate_tier', label: 'Recalculate Loyalty Tier', functionName: 'recalculateTier' });
        }
    }
    exports.beforeLoad = beforeLoad;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if ([context.UserEventType.EDIT, context.UserEventType.XEDIT].includes(context.type)) {
            const latestPoints = (0, loyaltyGlobals_1.getLatestPointsEntry)(context.newRecord.id.toString());
            (0, loyaltyGlobals_1.updatePointsOnCustomer)(context.newRecord.id.toString(), latestPoints);
        }
    }
    exports.afterSubmit = afterSubmit;
});
