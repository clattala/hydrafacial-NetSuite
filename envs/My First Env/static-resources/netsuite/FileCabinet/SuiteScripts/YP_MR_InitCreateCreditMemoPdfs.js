/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @author Chelsea Fagen, RSM
 */
ScriptVariables = {
    PDF_FOLDER : null
};
define(["N/runtime", "N/record", "N/render", "N/search"], function( runtime, record, render, search){

    /**
     * @description Acquires a collection of data
     *
     * @returns Array | Object | search.Search | mapReduce.ObjectRef | file.File Object
     */
    function getInputData(){

        try{
            var creditMemoSearch = search.create({
                type: search.Type.CREDIT_MEMO,
                filters:
                    [
                        ["type","anyof","CustCred"],
                        "AND",
                        ["status","anyof","CustCred:A","CustCred:B"],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["memorized", "is", "F"]
                    ],
                columns:
                    [
                        "custbody_yp_pdfcm",
                        "entity"
                    ]
            });

        }catch(e){
            log.error("Script Error", e);
        }

        log.debug("Credit Memos to Process", creditMemoSearch);
        return creditMemoSearch;
    }

    /**
     * @description Parses each row of data into a key/value pair
     * One key/value pair is passed per function invocation
     *
     * @param {*} context
     */
    function map(context){
        log.debug("enter map context", context);

        try{
            getParameters();
            if(!context || !context.value) return;
            var creditMemoSearch = JSON.parse( context.value);

            var pdfFile = render.transaction({
                entityId: Number( creditMemoSearch.id),
                printMode: render.PrintMode.PDF
            });

            pdfFile.folder = ScriptVariables.PDF_FOLDER;

            var pdfFileId = pdfFile.save();

            var customerId = creditMemoSearch.values.entity.value;

            creditMemoSearch.values.custbody_yp_pdfcm = pdfFileId;

            context.write({
                key: customerId,
                value: creditMemoSearch
            });

        }catch(e){
            log.error("Script Error", e);
        }

        log.debug("exit map context", context);

    }

    /**
     * @description Evaluates the data in each group
     * One group (key/value) is passed per function invocation
     *
     * @param {*} context
     */
    function reduce(context){
        log.debug("enter reduce context", context);

        try{

            if(!context || !context.values) return;

            for (var i in context.values) {

                var creditMemoSearch = JSON.parse(context.values[i]);
                var creditMemoRecordId = creditMemoSearch.id;

                var pdfFileId = creditMemoSearch.values.custbody_yp_pdfcm;

                record.submitFields({
                    type: record.Type.CREDIT_MEMO,
                    id: creditMemoRecordId,
                    values: {
                        custbody_yp_pdfcm: pdfFileId
                    }
                });

            }

        }catch(e){
            log.error("Script Error", e);
        }

        log.debug("exit reduce context", context);
    }


    /**
     * @description Summarizes the output of the previous stages
     * Used summarize the data from the entire map/reduce process and write it to a file or send an email
     * This stage is optional
     *
     * @param {*} summary
     */
    function summarize(summary){
        var type = summary.toString();
        log.debug(type + ' Usage Consumed', summary.usage);
        log.debug(type + ' Number of Queues', summary.concurrency);
        log.debug(type + ' Number of Yields', summary.yields);
    }
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

    function getParameters(){
        ScriptVariables.PDF_FOLDER = runtime.getCurrentScript().getParameter({ name: 'custscript_yp_cmfolder' });

        if (ScriptVariables.PDF_FOLDER == null || ScriptVariables.PDF_FOLDER == '') {
            showError('EMPTY_PARAMETER', 'Error retrieving script parameter: PDF Folder');
        }

    }

});