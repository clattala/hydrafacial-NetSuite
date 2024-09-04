/**
 * loadNavigationFile.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName SCA | Load SCA Navigation File
 * @NScriptType Suitelet
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/file", "N/log"], function (require, exports, file, log) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        if (context.request.method == 'GET') {
            let fileObj = file.load({ id: 2254676 });
            let fileContents = fileObj.getContents();
          log.debug('fileContents', fileContents);
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            return context.response.write({ output: fileContents });
        }
    }
    exports.onRequest = onRequest;
});
