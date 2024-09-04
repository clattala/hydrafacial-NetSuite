/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

/**
 * sets reference item custom memo description on matching item lines
 */

define(
    [
        'N/record'
        , 'N/search'
        , 'N/runtime'
    ],
    /**
     * @param{record} record
     * @param{search} search
     * @param{runtime} search
     */
    (
        record
        , search
        , runtime
    ) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            try {
                const { newRecord } = scriptContext;
                if (
                    scriptContext.UserEventType.CREATE === scriptContext.type
                    || scriptContext.UserEventType.EDIT === scriptContext.type
                ) {
                    const script = runtime.getCurrentScript();
                    const referenceItemId = Number(script.getParameter({ name: 'custscript_hf_refitemid' }));

                    if (referenceItemId) {
                        const billOfMtrlRev = newRecord.getValue({ fieldId: 'billofmaterialsrevision' });
                        const memoList = getReferenceMemoList(billOfMtrlRev, referenceItemId);
                        let memoIdx = 0;
                        const sublistId = `item`;
                        const lineCount = newRecord.getLineCount({ sublistId });

                        if (memoList.length > 0)
                            for (let line = 0; line < lineCount; line++) {
                                const currentItem = newRecord.getSublistValue({ sublistId, line, fieldId: 'item' })
                                if (Number(currentItem) === referenceItemId) {
                                    newRecord.setSublistValue({ sublistId, line, fieldId: 'description', value: memoList[memoIdx] });
                                    memoIdx++;
                                }
                            }
                    }
                }
            } catch (E) {
                log.error(`beforeSubmit:Error`, E)
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {

            } catch (E) {
                log.error('afterSubmit:Error', E);
            }
        }

        /**
         * returns list of memo's stored against revision reference items
         * @param {string} revisionId revision internalid
         */
        const getReferenceMemoList = (revisionId, referenceItemId) => {
            try {
                const memoList = [];
                const searchCols = {
                    item: search.createColumn({
                        name: "item",
                        join: "component",

                    }),
                    memo: search.createColumn({
                        name: "custrecord5",
                        join: "component"
                    })
                }

                search
                    .create({
                        type: "bomrevision",
                        filters:
                            [
                                ["internalidnumber", "equalto", revisionId],
                                "AND",
                                ["component.item", "anyof", referenceItemId]
                            ],
                        columns: Object.values(searchCols)
                    })
                    .run()
                    .each(function (result) {
                        memoList.push(result.getValue(searchCols.memo));
                        return true;
                    });

                log.debug('memoList', memoList)
                return memoList;

            } catch (E) {
                log.error('getReferenceMemoList:', E);
                throw E;
            }
        }

        return {
            beforeSubmit
            // , beforeLoad
            // , afterSubmit
        }

    });
