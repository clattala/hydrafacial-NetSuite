/**
 * loadAndSaveMassUpdate.ts
 *
 * @NScriptName HF | Load and Save | Mass Update
 * @NScriptType MassUpdateScript
 * @NApiVersion 2.1
 */
define(["N/log", "N/record"], function (log, record) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.each = void 0;
    function each(context) {
        try {
            log.audit(`${context.type} ${context.id}`, `starting load and save`);
            const rec = record.load({ type: context.type, id: context.id });
            rec.save({ ignoreMandatoryFields: true });
        }
        catch (e) {
            log.audit(`${context.type} ${context.id}`, `Failed to Save`);
        }
    }
    exports.each = each;
    return exports;
});
