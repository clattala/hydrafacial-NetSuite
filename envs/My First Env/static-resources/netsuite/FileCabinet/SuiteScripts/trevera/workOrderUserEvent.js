/**
 * workOrderUserEvent.ts
 * by Trevera, Inc.
 *
 * @NScriptName Work Order - User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.x
 */
define(["N/runtime", "./Utils/treveraUtilsUserEvents"], function (runtime, treveraUtilsUserEvents_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = exports.beforeLoad = void 0;
    function beforeLoad(context) {
        if (runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(context) {
        if (context.type != context.UserEventType.DELETE) {
            var validationContexts = [context.UserEventType.CREATE, context.UserEventType.COPY, context.UserEventType.DROPSHIP, context.UserEventType.EDIT];
            if (~validationContexts.indexOf(context.type)) {
                var subsidiary = context.newRecord.getValue({ fieldId: 'subsidiary' });
                treveraUtilsUserEvents_1.setLocationOnLines(context.newRecord, subsidiary);
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
    return exports;
});
