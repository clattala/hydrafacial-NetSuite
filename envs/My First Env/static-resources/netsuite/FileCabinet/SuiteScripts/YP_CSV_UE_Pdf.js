/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @author Chelsea Fagen
 * @date 12/11/2019
 * @description Creates/updates PDF invoices. Increments invoice number before saving if name is already taken.

 */
define(["N/file", "N/render", "N/record", "N/runtime", "N/task", "N/search","N/log"],

    function (file, render, record, runtime, task, search, log) {

        var PDF_FOLDER = 2438491;

        var UPDATE_INVOICE_PDFS_MAP_REDUCE_SCRIPT_ID = "customscript551";

        function beforeSubmit(context){
            try {
                //logic for only new invoices?
                if(context.type !== 'create'){
                    return
                }

                var invoiceName = context.newRecord.getValue({
                    fieldId: 'tranid'
                });
                log.debug('Before Submit Invoice Name:', invoiceName);

                var invNumSearch = search.load({
                    id: 'customsearch_invoicename'
                });

                var uniqueName = function(invoiceName){

                    invNumSearch.filterExpression = [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["numbertext", "is", invoiceName]
                    ];
                    var resultArr = [];
                    invNumSearch.run().each(function (result) {
                        resultArr.push(result);
                        return true;
                    });
                    if(resultArr.length>0){
                        log.debug('Name Taken');
                        var invoiceNameArr = invoiceName.split('');
                        var num = invoiceNameArr.filter(function (el) {
                            return !isNaN(Number(el))
                        });
                        var invoiceNumNoNum = invoiceNameArr.filter(function (el) {
                            return isNaN(Number(el))
                        }).join('');
                        var numPlusOne = Number(num.join('')) + 1;
                        var numPlusOneStr = numPlusOne.toString();

                        switch (numPlusOneStr.length) {
                            case 6:
                                numPlusOneStr = +numPlusOneStr;
                                break;
                            case 5:
                                numPlusOneStr = '0'+numPlusOneStr;
                                break;
                            case 4:
                                numPlusOneStr = '00'+numPlusOneStr;
                                break;
                            case 3:
                                numPlusOneStr = '000'+numPlusOneStr;
                                break;
                            case 2:
                                numPlusOneStr = '0000'+numPlusOneStr;
                                break;
                            case 1:
                                numPlusOneStr = '00000'+numPlusOneStr;
                                break;
                        }
                        var newNum = invoiceNumNoNum + numPlusOneStr;
                        log.debug('newNum',newNum);
                        uniqueName(newNum)

                    }else{
                        log.debug('name not taken:',invoiceName);
                        context.newRecord.setValue({
                            fieldId: 'tranid',
                            value: invoiceName
                        });
                    }

                };

                uniqueName(invoiceName)


            }catch(e){
                log.error('Before Submit Error',e);
            }
        }

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
                // If the script is not triggered by csv import
                //if (runtime.executionContext !== runtime.ContextType.CSV_IMPORT) {

                    if (scriptContext.newRecord.type === record.Type.INVOICE) {


                        invoicePdf(scriptContext);

                    } else if (scriptContext.newRecord.type === record.Type.CUSTOMER_PAYMENT) {

                        updateInvoicePdf(scriptContext);

                    } else if (scriptContext.newRecord.type === record.Type.CREDIT_MEMO) {

                        updateInvoicePdf(scriptContext);

                    }
               // }

            } catch (e) {
                log.error("Script Error", e);
            }

        }

        return {
            afterSubmit: afterSubmit,
            beforeSubmit:beforeSubmit
        };

        /**
         * @description Deletes old PDF, creates PDF of invoice and saves to file cabinet
         *
         * @param {Number} invoiceRecordId
         * @param {Number} invoiceRecordPdfInternalId
         */
        function createInvoice(invoiceRecordId, invoiceRecordPdfInternalId, scriptContext) {
            log.debug('scriptContext.type',scriptContext.type);
            // Delete old invoice
            if (invoiceRecordPdfInternalId) {

                file.delete({
                    id: invoiceRecordPdfInternalId
                });
            }
            if(scriptContext.type == 'delete'){
                return
            }


            log.debug('scriptContext',scriptContext.newRecord);


            var form = scriptContext.newRecord.getValue({
                fieldId:'customform'
            });
            log.debug('form',form);

            var pdfFile = render.transaction({
                entityId: Number(invoiceRecordId),
                printMode: render.PrintMode.PDF,
                formId: Number(form)
            });

            if (!pdfFile) return;

            pdfFile.folder = PDF_FOLDER;
            pdfFile.isOnline = true;

            var pdfFileId = pdfFile.save();
            log.debug("pdfFileId", pdfFileId);

            record.submitFields({
                type: record.Type.INVOICE,
                id: invoiceRecordId,
                values: {
                    custbody_yp_pdf: pdfFileId
                }
            });

            log.debug("pdfFileId", pdfFileId + 'Invoice Record ID' + invoiceRecordId);

            attachFile(pdfFileId, invoiceRecordId);

        }

        /**
         * @description Calls map/reduce script that updates invoice PDFs
         *
         * @param {Number} originRecordId
         * @param {String} originRecordType
         */
        function updateInvoicePdf(scriptContext) {

            //Condition removed, since this is called just for Payments and Credit Memos
            // if(scriptContext.type == 'delete'){
                
            //     return
            // }

            var transactionRecord = scriptContext.newRecord;

            var invoiceArray = [];

            var applyLineCount = transactionRecord.getLineCount({
                sublistId: "apply"
            });

            for (var i = 0; i < applyLineCount; i++) {

                var applyTranType = transactionRecord.getSublistValue({
                    sublistId: "apply",
                    fieldId: "trantype",
                    line: i
                });
                if (applyTranType != "CustInvc") continue;

                var invoiceRecordId = transactionRecord.getSublistValue({
                    sublistId: "apply",
                    fieldId: "internalid",
                    line: i
                });
                if (!invoiceRecordId) continue;

                invoiceArray.push({
                    invoiceRecordId: invoiceRecordId,
                    transactionLineNumber: i
                });

            }

            var updateInvoicePdfsMapReduceTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: UPDATE_INVOICE_PDFS_MAP_REDUCE_SCRIPT_ID,
                params: {
                    "custscript_yp_invoicearray": JSON.stringify(invoiceArray)

                }
            });

            var updateInvoicePdfsMapReduceTaskId = updateInvoicePdfsMapReduceTask.submit();
            log.debug("updateInvoicePdfsMapReduceTaskId", updateInvoicePdfsMapReduceTaskId);

        }

        /**
         * @description Gets information to create PDF from an invoice record
         *
         * @param {Object} scriptContext
         */
        function invoicePdf(scriptContext) {

            var invoiceRecord = scriptContext.newRecord;

            if (!invoiceRecord) return;

            var invoiceRecordStatusRef = invoiceRecord.getValue({
                fieldId: "statusRef"
            });

            // If invoice is already paid do not save PDF  as of 6/25/2020 changed this code to save the Invoice regardless
            // so that Salesforce will have correct copy of the Invoice
            // if (invoiceRecordStatusRef === "paidInFull") return;

            var invoiceRecordId = invoiceRecord.id;

            var invoiceRecordPdfInternalId = invoiceRecord.getValue({
                fieldId: "custbody_yp_pdf"
            });

            createInvoice(invoiceRecordId, invoiceRecordPdfInternalId, scriptContext);

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
                        type: record.Type.INVOICE,
                        id: recId
                    }
                });
            } catch(err){
                log.error("Script Error", err.message);
            }

        }

    });