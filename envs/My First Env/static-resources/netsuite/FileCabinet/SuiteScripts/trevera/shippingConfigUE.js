/**
 * shippingConfigUE.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Shipping Config UE
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/redirect", "N/runtime", "N/search"], function (require, exports, error, redirect, runtime, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = exports.beforeSubmit = exports.beforeLoad = exports.Errors = void 0;
    exports.Errors = {
        ConfigRecordNoDelete: {
            name: "CONFIG_NO_DELETE",
            message: "You cannot delete the only instance of this record type.",
            notifyOff: true
        },
        ConfigRecordExists: {
            name: "CONFIG_RECORD_ALREADY_EXISTS",
            message: "You cannot create more than one record of this type.",
            notifyOff: true
        }
    };
    function beforeLoad(context) {
        let isCreationEvent = ([context.UserEventType.CREATE, context.UserEventType.COPY].indexOf(context.type) > -1);
        if (isCreationEvent && recordExists(context.newRecord.type)) {
            redirectToExisting(context.newRecord.type);
        }
    }
    exports.beforeLoad = beforeLoad;
    function beforeSubmit(context) {
        if (context.type === context.UserEventType.DELETE) {
            throw error.create(exports.Errors.ConfigRecordNoDelete); // don't allow delete
        }
        if (context.type === context.UserEventType.CREATE && recordExists(context.newRecord.type)) {
            throw error.create(exports.Errors.ConfigRecordExists); // Ensure that only one instance of the record exists at a time
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function afterSubmit(context) {
        if ((context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) && runtime.executionContext == runtime.ContextType.USER_INTERFACE) {
            //updateConfigRecord(); call if fields require compilation
        }
    }
    exports.afterSubmit = afterSubmit;
    const recordExists = (type) => {
        return search.create({ type: type, filters: [['isinactive', 'is', false]] }).runPaged().count > 0;
    };
    const redirectToExisting = (type) => {
        const results = search.create({ type: type, filters: [['isinactive', 'is', false]] }).run().getRange({ start: 0, end: 1 });
        redirect.toRecord({ type: type, id: results[0].id, isEditMode: true });
    };
});
