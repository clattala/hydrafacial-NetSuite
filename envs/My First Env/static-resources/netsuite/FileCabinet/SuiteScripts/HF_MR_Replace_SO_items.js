/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {

    function getInputData() {

        return search.load({ id: 'customsearch_so_item_replacement_search' });
    }

    function map(context) {
        try {
            log.debug('context', context.value);
            var rowJson = JSON.parse(context.value);
            var salesOrderId = rowJson.values['internalid'].value;
            log.debug('salesorder id', salesOrderId);

            var itemToReplace = runtime.getCurrentScript().getParameter('custscript_item_to_replace');
            var replacedItem = runtime.getCurrentScript().getParameter('custscript_replaced_item');

            log.debug('item to replace', itemToReplace);
            log.debug('item replaced with', replacedItem);

            var salesOrdRec = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId,
                isDynamic: true,
            });

            //salesOrdRec.setValue('shipdate', '');
            var soLineCount = salesOrdRec.getLineCount({ sublistId: 'item' });
            log.debug('soLineCount', soLineCount);

            for (var i = 0; i < soLineCount; i++) {

                salesOrdRec.selectLine({ sublistId: 'item', line: i });
                var itemId = salesOrdRec.getCurrentSublistValue({ fieldId: 'item', sublistId: 'item' });
                var quantity = salesOrdRec.getCurrentSublistValue({ fieldId: 'quantity', sublistId: 'item' });
                var amount = salesOrdRec.getCurrentSublistValue({ fieldId: 'amount', sublistId: 'item' });
                var promiseDate = salesOrdRec.getCurrentSublistValue({ fieldId: 'custcol_promise_date', sublistId: 'item' });
                var expectedShipDate = salesOrdRec.getCurrentSublistValue({ fieldId: 'expectedshipdate', sublistId: 'item' });
                log.debug('current itemId', itemId);
                log.debug('quantity', quantity);

                if (itemId == itemToReplace) {
                    log.debug('item match found');
                    salesOrdRec.removeLine({ sublistId: 'item', line: i, ignoreRecalc: true });
                    log.debug('current item removed');
                    salesOrdRec.insertLine({ sublistId: 'item', line: i });
                    salesOrdRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: replacedItem });
                    salesOrdRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: amount ? amount : 0.00 });
                    salesOrdRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: quantity ? quantity : 0 });
                    salesOrdRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_promise_date', value: promiseDate ? new Date(promiseDate) : '' });
                    salesOrdRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'expectedshipdate', value: expectedShipDate ? new Date(expectedShipDate) : '' });

                    //salesOrdRec.setSublistValue({ fieldId: 'item', sublistId: 'item', line: i, value: replacedItem });
                    //salesOrdRec.setSublistValue({ fieldId: 'item', sublistId: 'amount', line: i, value: amount });
                    salesOrdRec.commitLine({ sublistId: 'item' });
                    log.debug('item replaced!');
                }
            }

            salesOrdRec.save();
        } catch (ex) {
            log.error('ex', ex)
        }

    }

    function reduce(context) {

    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
