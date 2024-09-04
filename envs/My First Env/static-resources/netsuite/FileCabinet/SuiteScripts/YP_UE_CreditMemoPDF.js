/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author Gabriela Mazariego
 * @date 01/24/2022
 * @description Creates/updates PDF Credit Memos. Increments Credit Memo number before saving if name is already taken.

 */

ScriptVariables = {
    pdfFolder: null,
    creditMemoMRScript: null
};

define(["N/error", "N/file", "N/render", "N/record", "N/runtime", "N/task", "N/search","N/log"],

    function (error, file, render, record, runtime, task, search, log) {


        // function beforeSubmit(context){
        //     try {
        //         //logic for only new invoices?
        //         if(context.type !== 'create'){
        //             return
        //         }
        //
        //         var cmName = context.newRecord.getValue({
        //             fieldId: 'tranid'
        //         });
        //         log.debug('Before Submit Credit Memo Name:', cmName);
        //
        //         var cmNumSearch = search.load({
        //             id: 'customsearch_invoicename'
        //         });
        //
        //         var uniqueName = function(invoiceName){
        //
        //             invNumSearch.filterExpression = [
        //                 ["type", "anyof", "CustInvc"],
        //                 "AND",
        //                 ["numbertext", "is", invoiceName]
        //             ];
        //             var resultArr = [];
        //             invNumSearch.run().each(function (result) {
        //                 resultArr.push(result);
        //                 return true;
        //             });
        //             if(resultArr.length>0){
        //                 log.debug('Name Taken');
        //                 var invoiceNameArr = invoiceName.split('');
        //                 var num = invoiceNameArr.filter(function (el) {
        //                     return !isNaN(Number(el))
        //                 });
        //                 var invoiceNumNoNum = invoiceNameArr.filter(function (el) {
        //                     return isNaN(Number(el))
        //                 }).join('');
        //                 var numPlusOne = Number(num.join('')) + 1;
        //                 var numPlusOneStr = numPlusOne.toString();
        //
        //                 switch (numPlusOneStr.length) {
        //                     case 6:
        //                         numPlusOneStr = +numPlusOneStr;
        //                         break;
        //                     case 5:
        //                         numPlusOneStr = '0'+numPlusOneStr;
        //                         break;
        //                     case 4:
        //                         numPlusOneStr = '00'+numPlusOneStr;
        //                         break;
        //                     case 3:
        //                         numPlusOneStr = '000'+numPlusOneStr;
        //                         break;
        //                     case 2:
        //                         numPlusOneStr = '0000'+numPlusOneStr;
        //                         break;
        //                     case 1:
        //                         numPlusOneStr = '00000'+numPlusOneStr;
        //                         break;
        //                 }
        //                 var newNum = invoiceNumNoNum + numPlusOneStr;
        //                 log.debug('newNum',newNum);
        //                 uniqueName(newNum)
        //
        //             }else{
        //                 log.debug('name not taken:',invoiceName);
        //                 context.newRecord.setValue({
        //                     fieldId: 'tranid',
        //                     value: invoiceName
        //                 });
        //             }
        //
        //         };
        //
        //         uniqueName(invoiceName)
        //
        //     }catch(e){
        //         log.error('Before Submit Error',e);
        //     }
        // }

        /**
         * @description Creates/updates PDF invoices
         *
         * @param {Object} scriptContext
         * @param {record.Record} scriptContext.newRecord - New record
         * @param {record.Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         */

        function afterSubmit(scriptContext) {
            log.debug("scriptContext.newRecord.type", scriptContext.newRecord.type);

            try {

                if (scriptContext.newRecord.type === record.Type.CREDIT_MEMO) {

                    createCreditMemoPDF(scriptContext);

                }

                if(scriptContext.newRecord.type === record.Type.CUSTOMER_PAYMENT){
                    updateTransactionPdf(scriptContext, 'credit');
                }

                if(scriptContext.newRecord.type === record.Type.CUSTOMER_REFUND){
                    updateTransactionPdf(scriptContext, 'apply');
                }

            } catch (e) {
                log.error("Script Error", e);
            }

        }

        return {
            afterSubmit: afterSubmit,
            //beforeSubmit:beforeSubmit
        };

        /**
         * @description Deletes old PDF, creates PDF of Credit Memo and saves to file cabinet
         *
         * @param {Number} invoiceRecordId
         * @param {Number} invoiceRecordPdfInternalId
         */

        function creditMemoPDF(recordId, recordPdfInternalId, scriptContext) {
            log.debug('scriptContext.type',scriptContext.type);
            getParameters();
            if(scriptContext.type == 'delete'){
                return
            }
            // Delete old pdf
            if (recordPdfInternalId) {

                file.delete({
                    id: recordPdfInternalId
                });
            }

            log.debug('scriptContext',scriptContext.newRecord);
            var form = scriptContext.newRecord.getValue({
                fieldId:'customform'
            });

            log.debug('form',form);

            var pdfFile = render.transaction({
                entityId: Number(recordId),
                printMode: render.PrintMode.PDF,
                formId: Number(form)
            });

            if (!pdfFile) return;
            pdfFile.folder = ScriptVariables.pdfFolder;
            pdfFile.isOnline = true;


            var pdfFileId = pdfFile.save();
            log.debug("pdfFileId", pdfFileId);

            log.debug('record ID: ', recordId);

            record.submitFields({
                type: record.Type.CREDIT_MEMO,
                id: recordId,
                values: {
                    custbody_yp_pdfcm: pdfFileId
                }
            });

            log.debug("pdfFileId", pdfFileId + ' Credit Memo Record ID ' + recordId);
            attachFile(pdfFileId, recordId);
        }

        /**
         * @description Gets information to create PDF from an invoice record
         *
         * @param {Object} scriptContext
         */
        function createCreditMemoPDF(scriptContext) {
            var cmRecord = scriptContext.newRecord;
            if (!cmRecord) return;

            var cmRecordId = cmRecord.id;
            var cmRecordPdfInternalId = cmRecord.getValue({
                fieldId: "custbody_yp_pdfcm"

            });

            creditMemoPDF(cmRecordId, cmRecordPdfInternalId, scriptContext);

        }

        /**
         * @description Calls map/reduce script that updates invoice PDFs
         *
         * @param {Number} originRecordId
         * @param {String} originRecordType
         */
        function updateTransactionPdf(scriptContext, sublistid) {

            getParameters();

            var transactionRecord = scriptContext.newRecord;
            var tranArray = [];
            var applyLineCount = transactionRecord.getLineCount({
                sublistId: sublistid//"credit"
            });

            log.debug('apply line count', applyLineCount);

            for (var i = 0; i < applyLineCount; i++) {

                var applyTranType = transactionRecord.getSublistValue({
                    sublistId: sublistid,
                    fieldId: "trantype",
                    line: i
                });

                log.debug('apply tran type', applyTranType);

                if (applyTranType != "CustCred") continue;

                var tranRecordId = transactionRecord.getSublistValue({
                    sublistId: sublistid,
                    fieldId: "internalid",
                    line: i
                });

                log.debug('tranRecordId', tranRecordId);

                if (!tranRecordId) continue;

                tranArray.push({
                    creditMemoRecordId: tranRecordId,
                    transactionLineNumber: i
                });

            }

            if(tranArray.length > 0){
                var updateTranPdfsMapReduceTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: ScriptVariables.creditMemoMRScript,
                    params: {
                        "custscript_yp_cmarray": JSON.stringify(tranArray)
                    }
                });

                var updateTranPdfsMapReduceTaskId = updateTranPdfsMapReduceTask.submit();
                log.debug("updateTranPdfsMapReduceTaskId", updateTranPdfsMapReduceTaskId);
            }


        }

        // Attches a copy of the invoice pdf to the invoice
        function attachFile(pdfId,recId){
            try{
                log.debug({title:'Inside file attachments'});
                record.attach({
                    record: {
                        type: 'file',
                        id: pdfId
                    },

                    to: {
                        type: record.Type.CREDIT_MEMO,
                        id: recId
                    }

                });

            } catch(err){
                log.error("Script Error", err.message);
            }

        }

        // This function creates and throws an error.
        function showError(errorType, errorMsg) {

            var myCustomError = error.create({
                name: errorType,
                message: errorMsg,
                notifyOff: false
            });

            // This will write 'Error: WRONG_PARAMETER_TYPE Wrong parameter type selected' to the log
            log.error('Error: ' + myCustomError.name , myCustomError.message);
            throw myCustomError;

        }

        function getParameters(){
            ScriptVariables.pdfFolder = runtime.getCurrentScript().getParameter({ name: 'custscript_yp_pdffolder' });
            ScriptVariables.creditMemoMRScript = runtime.getCurrentScript().getParameter({ name: 'custscript_yp_creditmemomr' });

            if (ScriptVariables.pdfFolder == null || ScriptVariables.pdfFolder == '') {
                showError('EMPTY_PARAMETER', 'Error retrieving script parameter: PDF Folder');
            }
            if (ScriptVariables.creditMemoMRScript == null || ScriptVariables.creditMemoMRScript == '') {
                showError('EMPTY_PARAMETER', 'Error retrieving script parameter: Credit Memo Map Reduce');
            }
        }
    });