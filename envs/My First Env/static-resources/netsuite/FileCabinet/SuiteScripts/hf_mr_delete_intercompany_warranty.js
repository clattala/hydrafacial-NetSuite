/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record'], function(search, record) {
    function getInputData() {
        return search.load({
            id: 'customsearch_intercompany_warranties'
        });
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        context.write({
            key: searchResult.id,
            value: searchResult.recordType
        });
    }

    function reduce(context) {
        context.values.forEach(function(recordType) {
            try {
                record.delete({
                    type: recordType,
                    id: context.key
                });
            } catch (e) {
                log.error('Error deleting record', e.toString());
            }
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce
    };
});
