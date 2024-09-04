/**
 * addressClient.ts
 * by Trevera, Inc.
 *
 * @NScriptName Address - Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define([], function () {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fieldChanged = void 0;
    function fieldChanged(context) {
        if (context.fieldId == 'zip') {
            var currentZip = context.currentRecord.getValue('zip');
            if ((/[a-z]/.test(currentZip)))
                context.currentRecord.setValue({ fieldId: 'zip', value: currentZip.toUpperCase() });
        }
    }
    exports.fieldChanged = fieldChanged;
    return exports;
});
