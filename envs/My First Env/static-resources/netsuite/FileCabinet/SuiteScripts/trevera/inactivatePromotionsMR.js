/**
 * inactivatePromotionsMR.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Inactivate Promotions
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/file", "N/email", "N/log", "N/record", "N/search"], function (require, exports, file, email, log, record, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        const searchResults = searchFiles();
        return searchResults;
    };
    exports.getInputData = getInputData;
    const map = (context) => {
        const mapObj = JSON.parse(context.value);
        context.write(mapObj.promotionid, JSON.stringify(mapObj));
    };
    exports.map = map;
    const reduce = (context) => {
        const valueObjs = context.values; // key is the externalid
        valueObjs.forEach(function (fileObj) {
            const mapObj = JSON.parse(fileObj);
            try {
                record.submitFields({ type: record.Type.PROMOTION_CODE, id: mapObj.promotionid, values: { 'isinactive': true } });
                mapObj.status = 'Success';
                mapObj.processingMessage = `${mapObj.promotionid} was inactivated.`;
                context.write(context.key, JSON.stringify(mapObj));
            }
            catch (e) {
                log.error('reduce fn error', e);
                mapObj.status = 'Failed';
                mapObj.processingMessage = `Error parsing information for ${mapObj.promotionid}: ${e.message}`;
                context.write(context.key, JSON.stringify(mapObj));
            }
        });
    };
    exports.reduce = reduce;
    const summarize = (context) => {
        const responseByFile = {};
        context.output.iterator().each(function (key, value) {
            log.debug(`summarize`, `key ${key} value ${value}`);
            const val = JSON.parse(value);
            const fileName = val.fileName;
            // group the lines based on their filename property so that we can send emails based on the file name
            // [SL-1295] Add grouping to the message map so messages are grouped properly
            if (!responseByFile[fileName])
                responseByFile[fileName] = { fileId: val.fileId, message: { successMsg: '', failureMsg: '' }, success: true };
            if (val.status == 'Success')
                responseByFile[fileName].message.successMsg += `${val.processingMessage}\r\n`;
            else {
                responseByFile[fileName].message.failureMsg += `${val.processingMessage}\r\n`;
                responseByFile[fileName].message.success += false;
            }
            return true;
        });
        log.debug('responseByFile', responseByFile);
        const subject = 'Promotions Inactivated Results';
        for (let fileName in responseByFile) {
            let messageBody = `Processing Results for ${fileName}:\r\n`;
            messageBody += `${responseByFile[fileName].message.successMsg}${responseByFile[fileName].message.failureMsg}`;
            // send email of results
            email.send({
                author: 339,
                recipients: [339, 4],
                subject: subject,
                body: messageBody
            });
            log.debug(`moving file ${responseByFile[fileName].fileId}`, `was successful? ${responseByFile[fileName].success}`);
            moveFile(responseByFile[fileName].fileId, responseByFile[fileName].success);
        }
        log.audit('summarize', 'Execution complete!');
    };
    exports.summarize = summarize;
    /** get all the files in the folder and process them into individual lines */
    function searchFiles() {
        const fileSearchObj = search.create({
            type: search.Type.FOLDER,
            filters: [['internalid', 'anyof', '3530290']],
            columns: [
                search.createColumn({ name: 'internalid', join: 'file' }),
                search.createColumn({ name: 'filetype', join: 'file' }),
                search.createColumn({ name: 'name', join: 'file' })
            ]
        });
        let fileLinesToProcess = [];
        const searchResultCount = fileSearchObj.runPaged().count;
        log.audit('searchFiles', `fileSearchObj result count: ${searchResultCount}`);
        fileSearchObj.run().each(function (result) {
            const fileId = result.getValue({ name: 'internalid', join: 'file' });
            const fileType = result.getValue({ name: 'filetype', join: 'file' });
            //log.debug('fileType', fileType);
            if (fileId && fileType == 'CSV') {
                const lines = getLinesFromFile(fileId);
                if (lines.length > 0)
                    fileLinesToProcess = fileLinesToProcess.concat(lines);
            }
            else
                moveFile(fileId, false); // move the file from the folder
            return true;
        });
        return fileLinesToProcess;
    }
    function getLinesFromFile(fileId) {
        log.audit('getLinesFromFile', `processing fileId ${fileId}`);
        const fileToProcess = file.load({ id: fileId }); // Load file and iterate through the lines
        const fileName = fileToProcess.name;
        const recordsToProcess = [];
        const iterator = fileToProcess.lines.iterator(); // Obtain an iterator to process each line in the file
        // Skip the first line, which is the header line
        iterator.each(function () { return false; });
        // Process each line in the file
        iterator.each(function (line) {
            const lineValues = line.value.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const lineValue1 = lineValues[1]; // internalid
            if (lineValue1) {
                const promotionId = lineValues[1];
                //log.debug('getLinesFromFile', `promotion: ${promotionId}`);
                recordsToProcess.push({
                    promotionid: promotionId,
                    status: 'awaitingProcessing',
                    processingMessage: '',
                    fileName, fileId
                });
            }
            return true;
        });
        return recordsToProcess;
    }
    function moveFile(fileId, isSuccess) {
        if (isSuccess) {
            const fileObj = file.copy({ id: Number(fileId), folder: 3530291, conflictResolution: file.NameConflictResolution.RENAME_TO_UNIQUE });
            log.audit('moveFile', `fileObj was copied to the success folder ${JSON.stringify(fileObj)}`);
            file.delete({ id: fileId });
        }
        else {
            var fileObj = file.copy({ id: Number(fileId), folder: 3530292, conflictResolution: file.NameConflictResolution.RENAME_TO_UNIQUE });
            log.audit('moveFile', `fileObj was copied to the failed folder ${JSON.stringify(fileObj)}`);
            file.delete({ id: fileId });
        }
        return true;
    }
});
