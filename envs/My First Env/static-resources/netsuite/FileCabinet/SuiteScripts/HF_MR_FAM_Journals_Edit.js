/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function getInputData() {
        log.debug('entered getinputdata stage');

        return search.load({
            type: 'journalentry',
            id: 'customsearch_fam_journal_entries'
        });
    }

    function getSubsidiaryUser(subsidiary) {

        var employeeSearchObj = search.create({
            type: "employee",
            filters:
                [
                    ["custentity_jg_system_journalentry_crtr", "is", "T"],
                    "AND",
                    ["subsidiary", "anyof", subsidiary]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({ name: "subsidiarynohierarchy", label: "Subsidiary (no hierarchy)" })
                ]
        });
        var searchResultCount = employeeSearchObj.runPaged().count;
        log.debug("employeeSearchObj result count", searchResultCount);
        var jeCreatorID;
        if (searchResultCount == 1) {
            employeeSearchObj.run().each(function (result) {
                jeCreatorID = result.getValue('internalid');
                return true;
            });
        }


        return jeCreatorID;
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        log.debug('searchResult', searchResult);

        var jeID = searchResult.id;

        context.write({
            key: jeID,
            value: jeID
        });
    }

    function reduce(context) {
        try {
            var jeID = context.key;
            log.debug('je id in reduce', jeID);

            var objRecord = record.load({
                type: record.Type.JOURNAL_ENTRY,
                id: jeID
            });

            var subsidiary = objRecord.getValue('subsidiary');
            log.debug(' subsidiary: ' + subsidiary);

            if (subsidiary != null || subsidiary != undefined || subsidiary != '') {
                var jeCreatorID = getSubsidiaryUser(subsidiary);
            }

            log.debug('jeCreatorID', jeCreatorID);

            var createdby = objRecord.getValue('custbody_hf_appr_createdby');
            var editedby = objRecord.getValue('custbody_hf_appr_editedby');
            log.debug('editedby', editedby);
            log.debug('createdby', createdby);
            objRecord.setValue({
                fieldId: 'memo',
                value: 'FAM'
            });

            if (createdby == '' || createdby == null || createdby == undefined) {
                objRecord.setValue({
                    fieldId: 'custbody_hf_appr_createdby',
                    value: jeCreatorID
                });
            }

            if (editedby == '' || editedby == null || editedby == undefined) {
                objRecord.setValue({
                    fieldId: 'custbody_hf_appr_editedby',
                    value: jeCreatorID
                });
            }

            objRecord.save();
        } catch (ex) {
            log.debug('ex', ex);
        }


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
