/**
 * itemClient.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Item | Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/ui/dialog", "N/ui/message", "./Utils/itemUtils"], function (require, exports, dialog, message, itemUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveRecord = exports.fieldChanged = exports.pageInit = void 0;
    let MODE = '';
    function pageInit(context) {
        MODE = context.mode;
        console.log('hello');
        if (context.mode == 'create' && ['inventoryitem', 'serializedinventoryitem', 'lotnumberedinventoryitem'].includes(context.currentRecord.type)) {
            const errorMessage = message.create({ type: message.Type.ERROR, title: 'Not Allowed', message: 'Inventory Items may not be created via the UI. Please create an Assembly.' });
            errorMessage.show();
        }
    }
    exports.pageInit = pageInit;
    function fieldChanged(context) {
        if (context.fieldId == 'itemid')
            validateNameDuplicate(context.currentRecord);
        if (context.fieldId == itemUtils_1._ITEM_FIELD_GROUP)
            (0, itemUtils_1.setGLCode)(context.currentRecord);
    }
    exports.fieldChanged = fieldChanged;
    function saveRecord(context) {
        if (MODE == 'create' && ['inventoryitem', 'serializedinventoryitem', 'lotnumberedinventoryitem'].includes(context.currentRecord.type)) {
            dialog.alert({ title: 'Not Allowed', message: `Inventory Items may not be created via the UI. Please create an Assembly.` });
            return false;
        }
        const validateName = validateNameDuplicate(context.currentRecord);
        if (!validateName)
            return false;
        return true;
    }
    exports.saveRecord = saveRecord;
    function validateNameDuplicate(rec) {
        let matches = [];
        const itemName = rec.getValue('itemid');
        if (MODE == 'create')
            matches = (0, itemUtils_1.searchItemByName)(itemName);
        else
            matches = (0, itemUtils_1.searchItemByName)(itemName, rec.id);
        if (matches.length > 0) {
            dialog.alert({ title: 'Item Already Exists', message: `An item with the name ${itemName} already exists. Please select a different name;` });
            return false;
        }
        return true;
    }
});
