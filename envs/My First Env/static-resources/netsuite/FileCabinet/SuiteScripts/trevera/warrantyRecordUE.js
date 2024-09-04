/**
 * warrantyRecordUE.ts
 * by Trevera, Inc.
 *
 * @NScriptName Warranty Record - UE
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["N/task"], function (task) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE) {
            return;
        }
        var mrScript = task.create({ taskType: task.TaskType.MAP_REDUCE, scriptId: 'customscript_trv_promos_update_eligibili' });
        mrScript.params = {};
        mrScript.submit();
    }
    exports.afterSubmit = afterSubmit;
    return exports;
});
