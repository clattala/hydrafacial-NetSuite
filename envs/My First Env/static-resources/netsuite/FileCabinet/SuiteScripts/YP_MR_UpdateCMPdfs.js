/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @author Gabriela Mazariego
 */
ScriptVariables = {
    pdfFolder: 2438390
}
define(["N/file", "N/record", "N/runtime", "N/search", "N/render"],
    function (file, record, runtime, search, render) {

        /**
         * @description Gets Credit Memo information from transaction record
         *
         * @returns Array | Object | search.Search | mapReduce.ObjectRef | file.File Object
         */
        function getInputData() {
            var creditMemoArray = [];
            try {
                var mapReduceScript = runtime.getCurrentScript();
                creditMemoArray = JSON.parse(mapReduceScript.getParameter({
                    name: "custscript_yp_cmarray"
                }));
                log.debug('creditMemoArray', creditMemoArray);
            } catch (e) {
                log.error("Script Error", e);
                log.error("mapReduceScript", runtime.getCurrentScript());
            }
            return creditMemoArray;
        }
        /**
         * @description Deletes current Credit Memo PDF and sets custbody_yp_pdfcm to 0 which will trigger user event that creates new Credit Memo PDF
         *
         * @param {*} context
         */
        function map(context) {
            log.debug("enter map context", context);
            getParameters();
            try {
                if (!context || !context.value) return;
                var credMemoValues = JSON.parse(context.value);
                var credMemoRecordId = credMemoValues.creditMemoRecordId;
                if (!credMemoRecordId) return;
                log.debug('credRecordId', credMemoRecordId);
                var creditMemoRecordLookup = search.lookupFields({
                    type: search.Type.CREDIT_MEMO,
                    id: credMemoRecordId,
                    columns: [
                        "custbody_yp_pdfcm"
                    ]
                });
                var creditMemoPdfFileId = creditMemoRecordLookup ? creditMemoRecordLookup.custbody_yp_pdfcm : null;
                if (creditMemoPdfFileId) {
                    file.delete({
                        id: creditMemoPdfFileId
                    });
                }
                var pdfFile = render.transaction({
                    entityId: Number(credMemoRecordId),
                    printMode: render.PrintMode.PDF
                });
                if (!pdfFile) return;
                pdfFile.folder = ScriptVariables.pdfFolder
                var pdfFileId = pdfFile.save();
                log.debug('pdfFile', pdfFile);
                log.debug("pdfFileId", pdfFileId);
                record.submitFields({
                    type: record.Type.CREDIT_MEMO,
                    id: credMemoRecordId,
                    values: {
                        custbody_yp_pdfcm: pdfFileId
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

        function getParameters() {
            ScriptVariables.pdfFolder = runtime.getCurrentScript().getParameter({ name: 'custscript_yp_mrpdffolder' });

            if (ScriptVariables.pdfFolder == null || ScriptVariables.pdfFolder == '') {
                showError('EMPTY_PARAMETER', 'Error retrieving script parameter: PDF Folder');
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
            log.error('Error: ' + myCustomError.name, myCustomError.message);
            throw myCustomError;

        }


        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });