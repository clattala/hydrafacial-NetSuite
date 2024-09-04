/**
 * salesOrderLoyaltyUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty | Sales Order User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "./loyaltyGlobals", "N/error", "N/log", "N/record", "N/runtime"], function (require, exports, loyaltyGlobals_1, err, log, record, runtime) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = exports.beforeSubmit = exports.beforeLoad = void 0;
    function beforeLoad(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.COPY) {
            context.newRecord.setValue('custbody_hf_redeemed_points', false);
            context.newRecord.setValue('custbody_hf_num_points_redeemed', 0);
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE || (context.type == context.UserEventType.EDIT && runtime.envType == runtime.EnvType.SANDBOX) || runtime.getCurrentUser().role == 3) {
            /** check if points total is more than what's available and don't allow redemption when it is */
            const customerId = context.newRecord.getValue('entity');
            checkForLoyaltyPromotions(context.newRecord);
            const redeemedPoints = context.newRecord.getValue('custbody_hf_redeemed_points');
            const numPointsRedeemed = Number(context.newRecord.getValue('custbody_hf_num_points_redeemed'));
            if (redeemedPoints) {
                const config = (0, loyaltyGlobals_1.getCustomerTier)(customerId);
                if (config.optedIn) {
                    const currentPointTotal = (0, loyaltyGlobals_1.getLatestPointsEntry)(customerId);
                    const points = numPointsRedeemed + currentPointTotal;
                    if (points < 0)
                        throw err.create({ name: 'ERR_NEGATIVE_LOYALTY_POINTS', message: 'Points balance cannot be less than zero.' });
                }
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        const fromWeb = (runtime.ContextType.WEBSTORE == runtime.executionContext && context.type == context.UserEventType.CREATE)
            || (context.newRecord.getValue('source') == 'Web (Hydrafacial)' && context.type == context.UserEventType.EDIT);
        log.debug(`from web: ${fromWeb}`, context.newRecord.getValue('source'));
        if (fromWeb) { /** can only redeem points on the website */
            /** on create, if points were redeemed against an order, add a pending points entry the pending points and points redeemed fields are set in the webstore on the sales order, queue points redemption (pending state) */
            const customerId = context.newRecord.getValue('entity');
            const redeemedPoints = context.newRecord.getValue('custbody_hf_redeemed_points');
            const numPointsRedeemed = Number(context.newRecord.getValue('custbody_hf_num_points_redeemed'));
            if (redeemedPoints) {
                (0, loyaltyGlobals_1.queuePointsRedemption)(customerId, -numPointsRedeemed, context.newRecord.id, context.newRecord.getValue('trandate'), context.type == context.UserEventType.EDIT);
            }
        }
        const newStatus = context.newRecord.getValue('status');
        const oldStatus = context.oldRecord.getValue('status');
        const newOrderStatus = context.newRecord.getValue('orderstatus');
        const oldOrderStatus = context.oldRecord.getValue('orderstatus');
        log.debug(`new status ${newStatus} old status ${oldStatus}`, `new status ${newOrderStatus} old status ${oldOrderStatus}`);
        const isCancelled = /*newStatus != oldStatus &&*/ (newStatus == 'C' || newStatus == 'Cancelled');
        if (context.type == context.UserEventType.CANCEL || isCancelled) {
            /** on cancel of an order, if points were redeemed against an order, add a pending points entry the pending points and points redeemed fields are set in the webstore on the sales order, revert points deduction */
            const customerId = context.newRecord.getValue('entity');
            const redeemedPoints = context.newRecord.getValue('custbody_hf_redeemed_points');
            if (redeemedPoints) {
                (0, loyaltyGlobals_1.cancelPointsRedemption)(customerId, context.newRecord.id, context.newRecord.getValue('trandate'));
            }
        }
    }
    exports.afterSubmit = afterSubmit;
    /** make sure amount applied is correct */
    function checkForLoyaltyPromotions(rec) {
        const promotions = rec.getLineCount('promotions');
        if (promotions > 0) {
            for (let line = 0; line < promotions; line++) {
                const promotionId = rec.getSublistValue({ sublistId: 'promotions', fieldId: 'promocode', line });
                log.debug('id', promotionId);
                const promotionRec = record.load({ type: record.Type.PROMOTION_CODE, id: promotionId });
                const promotionName = promotionRec.getValue('name');
                const amount = rec.getSublistValue({ sublistId: 'promotions', fieldId: 'discountrate', line });
                if (promotionName.includes('Hydrafacial Loyalty Rewards Redemption')) {
                    log.debug('promotion name', `promotion name ${promotionName} is for amount ${amount}`);
                    rec.setValue('custbody_hf_num_points_redeemed', Math.abs(amount));
                }
            }
        }
    }
});
