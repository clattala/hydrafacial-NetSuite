/**
 * itemUE.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Item | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/log", "N/record", "N/runtime", "./Utils/itemUtils"], function (require, exports, error, log, record, runtime, itemUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    function beforeSubmit(context) {
        log.debug(`beforeSubmit context.newRecord.type ${context.newRecord.type}`, `context ${context.type} runtime context ${runtime.executionContext} ${context.newRecord.id}`);
        if (context.type == context.UserEventType.DELETE)
            return;
        if (context.type == context.UserEventType.CREATE && [record.Type.INVENTORY_ITEM, record.Type.SERIALIZED_INVENTORY_ITEM, record.Type.LOT_NUMBERED_INVENTORY_ITEM].includes(context.newRecord.type)) {
            throw error.create({ name: 'ERR_NOT_ALLOWED', message: 'Inventory Items can not be created via the UI. Please create an Assembly.t', notifyOff: false });
        }
        if ([context.UserEventType.CREATE, context.UserEventType.EDIT, context.UserEventType.XEDIT].includes(context.type)) {
            validateNameDuplicate(context.newRecord);
            (0, itemUtils_1.setGLCode)(context.newRecord);
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function validateNameDuplicate(rec) {
        let matches = [];
        const itemName = rec.getValue('itemid');
        if (rec.id)
            matches = (0, itemUtils_1.searchItemByName)(itemName, rec.id);
        else
            matches = (0, itemUtils_1.searchItemByName)(itemName);
        if (matches.length > 0) {
            throw error.create({ name: 'DUPLICATE_NAMED_ITEM', message: `There is already item with the name ${itemName}.  Please choose another name.`, notifyOff: false });
        }
    }
});
