/**
 * salesOrderUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Sales Order | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/log", "N/runtime", "N/ui/serverWidget", "./Utils/hfGlobalConfig", "./Utils/shippingCutoff", "./Utils/hfEntityDefaults", "./Utils/hfTransactionUtils"], function (require, exports, error, log, runtime, serverWidget, hfGlobalConfig_1, shippingCutoff_1, hfEntityDefaults_1, hfTransactionUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = exports.beforeLoad = void 0;
    const UK_SALES_ORDER_FORM = '473';
    function beforeLoad(context) {
        log.debug(`beforeLoad context.newRecord.type ${context.newRecord.type}`, `context ${context.type} runtime context ${runtime.executionContext} ${context.newRecord.id}`);
        if (context.type == context.UserEventType.DELETE)
            return;
        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
            const role = runtime.getCurrentUser().role;
            if (role != 3) {
                const statusField = context.form.getField({ id: 'orderstatus' });
                if (statusField)
                    statusField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
            }
            if (context.type == context.UserEventType.CREATE) { // can't set any defaults if the entity isn't populated
                const entityClass = (0, hfEntityDefaults_1.setEntityDefaults)(context.newRecord);
                if (entityClass) {
                    for (let line = 0; line < context.newRecord.getLineCount({ sublistId: 'item' }); line++) {
                        context.newRecord.setSublistValue({ sublistId: 'item', fieldId: 'class', value: entityClass, line }); // set line class to customer region
                    }
                }
                (0, hfTransactionUtils_1.setLocationOnLines)(context.newRecord);
            }
        }
        if (runtime.ContextType.WEBSTORE != runtime.executionContext && context.type == context.UserEventType.CREATE) {
            try {
                context.newRecord.setValue('handlingmode', 'SAVE_ONLY');
            }
            catch (e) {
                log.error('error setting handling mode: ', e.message);
            }
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(context) {
        log.debug(`beforeSubmit context.newRecord.type ${context.newRecord.type}`, `context ${context.type} runtime context ${runtime.executionContext} ${context.newRecord.id}`);
        if (context.type == context.UserEventType.DELETE)
            return;
        const subsidiary = context.newRecord.getValue({ fieldId: 'subsidiary' });
        if (!subsidiary && context.type != context.UserEventType.XEDIT) {
          log.error(`beforeSubmit context.newRecord.type ${context.newRecord.type}`, `context ${context.type} runtime context ${runtime.executionContext} ${context.newRecord.id}, subsidiary ${subsidiary}`);
            throw error.create({ "name": "ERR_SUBSIDIARY_MISSING", "message": `Please enter a subsidiary for this sales order.`, "notifyOff": false });
        }
        const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        const validationContexts = [context.UserEventType.CREATE, context.UserEventType.COPY, context.UserEventType.DROPSHIP, context.UserEventType.EDIT];
        if (~validationContexts.indexOf(context.type)) {
            (0, hfTransactionUtils_1.setLocationOnLines)(context.newRecord);
            try {
                (0, hfTransactionUtils_1.setStrikethroughPriceOnLines)(context.newRecord);
            }
            catch (e) {
                log.error('error setting up prices', e);
            }
        }
        const isClosed = ['C', 'F', 'G', 'H'].includes(context.newRecord.getValue({ fieldId: 'orderstatus' }));
        log.audit('beforeSubmit', `status: ${context.newRecord.getValue({ fieldId: 'orderstatus' })} isClosed: ${isClosed}`);
        if (subsidiary == _globalConfig.usSubsidiary.toString()) {
            const currentShipDate = !isClosed ? (0, shippingCutoff_1.setShippingDateFromCutoffTime)(context.newRecord, _globalConfig.usSubsidiary) : context.newRecord.getValue('shipdate');
            for (let line = 0; line < context.newRecord.getLineCount({ sublistId: 'item' }); line++) {
                const closed = context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'isclosed', line });
                const quantity = Number(context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line }));
                const quantityfulfilled = Number(context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantityfulfilled', line }));
                if (!closed && quantityfulfilled < quantity)
                    context.newRecord.setSublistValue({ sublistId: 'item', fieldId: 'expectedshipdate', value: currentShipDate, line });
            }
        }
        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.COPY) {
            if (subsidiary == _globalConfig.ukSubsidiary.toString())
                context.newRecord.setValue('customform', UK_SALES_ORDER_FORM);
        }
        if (context.type == context.UserEventType.CREATE && runtime.executionContext == runtime.ContextType.WEBSTORE)
            (0, hfTransactionUtils_1.setWebDefaults)(context.newRecord);
        if (context.type == context.UserEventType.CREATE || runtime.getCurrentUser().id == 339) {
            (0, hfTransactionUtils_1.updatePromotionItems)(context.newRecord);
            (0, hfTransactionUtils_1.addCOTaxItem)(context.newRecord);
            (0, hfTransactionUtils_1.setDefaultLocationFromSubsidiary)(context.newRecord);
            const customerClass = (0, hfEntityDefaults_1.setEntityDefaults)(context.newRecord);
            if (customerClass) {
                for (let line = 0; line < context.newRecord.getLineCount({ sublistId: 'item' }); line++) {
                    context.newRecord.setSublistValue({ sublistId: 'item', fieldId: 'class', value: customerClass, line });
                }
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
});
