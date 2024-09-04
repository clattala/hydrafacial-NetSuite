/**
 * purchaseUserEvent.ts
 * by Trevera, Inc.
 *
 * @NScriptName HF | Purchase | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "./Utils/hfGlobalConfig"], function (require, exports, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    function beforeSubmit(context) {
        if (context.type != context.UserEventType.DELETE) {
            const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
            const currentForm = context.newRecord.getValue({ fieldId: 'customform' });
            const validationContexts = [context.UserEventType.CREATE, context.UserEventType.COPY, context.UserEventType.DROPSHIP, context.UserEventType.EDIT];
            if (Number(context.newRecord.getValue('subsidiary')) == _globalConfig.usSubsidiary && ~validationContexts.indexOf(context.type) && !_globalConfig.outsourcedPOForms.includes(currentForm)) {
                const numberLines = context.newRecord.getLineCount({ sublistId: 'item' });
                for (let line = 0; line < numberLines; line++) {
                    const itemType = context.newRecord.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: line });
                    if (itemType != 'EndGroup') {
                        context.newRecord.setSublistValue({ sublistId: 'item', fieldId: 'location', value: _globalConfig.defaultReceivingLocation, line });
                    }
                }
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
});
