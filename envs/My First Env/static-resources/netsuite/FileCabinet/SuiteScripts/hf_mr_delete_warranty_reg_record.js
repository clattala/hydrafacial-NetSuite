/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function getInputData() {
        return search.load({
            type: 'customrecord_wrm_warrantyreg',
            id: 'customsearch17752'
        });
    }

    function map(context) {
        try {
            let searchResult = JSON.parse(context.value);

            context.write({
                key: searchResult.id,
                value: searchResult.values
            });

        } catch (ex) {
            log.error('exception in map', ex);
        }
    }

    function reduce(context){
        let key = context.key;

        try {
            record.delete({
                type : 'customrecord_wrm_warrantyreg',
                id : key
            });
        } catch (ex) {
            log.error('exception in reduce ' + key, ex);
        }
    }

    function summarize(summary) {
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
