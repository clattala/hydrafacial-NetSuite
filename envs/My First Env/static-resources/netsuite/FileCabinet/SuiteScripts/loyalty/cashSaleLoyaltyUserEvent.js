/**
 * cashSaleLoyaltyUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty | Cash Sale User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/runtime", "N/search", "./loyaltyGlobals"], function (require, exports, log, runtime, search, loyaltyGlobals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    const orderCutoff = 6193916;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE || (context.type == context.UserEventType.EDIT && runtime.getCurrentUser().id == 339)) {
            const customerId = context.newRecord.getValue('entity');
            const config = (0, loyaltyGlobals_1.getCustomerTier)(customerId);
            const createdFrom = context.newRecord.getValue({ fieldId: 'createdfrom' });
            log.debug('createdFrom', createdFrom);
            if (config.optedIn && Number(createdFrom) > orderCutoff) {
                const totalEligibleForPoints = (0, loyaltyGlobals_1.getTotalEligibleForPoints)(context.newRecord);
                /** on creation of a cash sale, if the items on the cash sale are eligible for points and the user is opted in with a valid tier then create a points entry for them to earn points */
                (0, loyaltyGlobals_1.earnPoints)(customerId, totalEligibleForPoints, context.newRecord.id, context.newRecord.getValue('trandate'));
                if ((0, loyaltyGlobals_1.isCreatedFromSO)(createdFrom)) {
                    const redeemedPointsLookup = search.lookupFields({ type: search.Type.SALES_ORDER, id: createdFrom, columns: ['custbody_hf_redeemed_points'] });
                    const redeemedPoints = redeemedPointsLookup['custbody_hf_redeemed_points'];
                    /** if the cash sale is created from a SO and points were redeemed, then update the pending points entry to be 'redeemed' instead of 'pending' */
                    if (redeemedPoints)
                        (0, loyaltyGlobals_1.updatePendingPointsEntry)(createdFrom);
                }
            }
            else
                log.debug(`no points action take`, `customer opted in: ${config.optedIn}, or order before the cutoff ${Number(createdFrom) > orderCutoff}`);
        }
    }
    exports.afterSubmit = afterSubmit;
});
