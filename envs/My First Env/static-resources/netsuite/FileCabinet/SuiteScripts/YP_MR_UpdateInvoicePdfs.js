/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @author Chelsea Fagen
 */
define(["N/file", "N/record", "N/runtime", "N/search","N/render"],
    function (file, record, runtime, search, render) {
        var PDF_FOLDER = 2438491;

        /**
         * @description Gets invoice information from transaction record
         *
         * @returns Array | Object | search.Search | mapReduce.ObjectRef | file.File Object
         */
        function getInputData() {
            var invoiceArray = [];
            try {
                var mapReduceScript = runtime.getCurrentScript();
                invoiceArray =  JSON.parse(mapReduceScript.getParameter({
                    name: "custscript_yp_invoicearray"
                }));
                log.debug('invoiceArray', invoiceArray);
            } catch (e) {
                log.error("Script Error", e);
                log.error("mapReduceScript", runtime.getCurrentScript());
            }
            return invoiceArray;
        }
        /**
         * @description Deletes current invoice PDF and sets custbody_yp_pdf to 0 which will trigger user event that creates new invoice PDF
         *
         * @param {*} context
         */
        function map(context) {
            log.debug("enter map context", context);
            try {
                if (!context || !context.value) return;
                var invoiceValues = JSON.parse(context.value);
                var invoiceRecordId = invoiceValues.invoiceRecordId;
                if (!invoiceRecordId) return;
                log.debug('invoiceRecordId',invoiceRecordId);
                var invoiceRecordLookup = search.lookupFields({
                    type: search.Type.INVOICE,
                    id: invoiceRecordId,
                    columns: [
                        "custbody_yp_pdf"
                    ]
                });
                var invoicePdfFileId = invoiceRecordLookup ? invoiceRecordLookup.custbody_yp_pdf : null;
                if (invoicePdfFileId) {
                    file.delete({
                        id: invoicePdfFileId
                    });
                }
                var pdfFile = render.transaction({
                    entityId: Number(invoiceRecordId),
                    printMode: render.PrintMode.PDF
                });
                if (!pdfFile) return;
                pdfFile.folder = PDF_FOLDER;
                var pdfFileId = pdfFile.save();
                log.debug('pdfFile',pdfFile);
                log.debug("pdfFileId", pdfFileId);
                record.submitFields({
                    type: record.Type.INVOICE,
                    id: invoiceRecordId,
                    values: {
                        custbody_yp_pdf: pdfFileId
                    }
                });
            } catch (e) {
                log.error("Script Error", e);
            }
            log.debug("exit map context", context);
        }
        /**
         * @description Summarizes the output of the previous stages
         *
         * @param {*} summary
         */
        function summarize(summary) {
            var type = summary.toString();
            log.debug(type + ' Usage Consumed', summary.usage);
            log.debug(type + ' Number of Queues', summary.concurrency);
            log.debug(type + ' Number of Yields', summary.yields);
        }
        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });