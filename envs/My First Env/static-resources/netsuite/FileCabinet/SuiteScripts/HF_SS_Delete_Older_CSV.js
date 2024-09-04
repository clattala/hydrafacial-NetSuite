/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 * /*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-5673
 file Name   : HF_SS_Delete_Older_CSV.js
Date          : 12/08/2022
Author        : Pavan Kaleru
Description   : Script to delete CSV files in a folder which are older than 15 days in file cabinet
*************************************************************/
 
define(['N/search', 'N/runtime', 'N/file'], function(search, runtime, file) {

    function execute(scriptContext) {
        try {
            var scriptObj = runtime.getCurrentScript();
            var folderId = scriptObj.getParameter({ // get script parameter value to get last internal id set
                name: 'custscript_delete_files_in_folder'
            });
            if (folderId) {
                deleteUnusedFiles(folderId)
            }
        } catch (e) {
            log.error('function execute error message: ', e.message);
        }
    }

    function deleteUnusedFiles(folderId) {
        var fileSearchObj = search.create({
            type: "file",
            filters: [
                ["formulanumeric: TO_DATE({today}) - TO_DATE({modified})", "greaterthan", "15"],
                "AND",
                ["folder", "anyof", folderId],
                "AND",
                ["filetype", "anyof", "CSV"]
            ],
            columns: [
                search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                }),
                search.createColumn({
                    name: "folder",
                    label: "Folder"
                }),
                search.createColumn({
                    name: "documentsize",
                    label: "Size (KB)"
                }),
                search.createColumn({
                    name: "url",
                    label: "URL"
                }),
                search.createColumn({
                    name: "internalid",
                    label: "internalid"
                }),
                search.createColumn({
                    name: "modified",
                    label: "Last Modified"
                }),
                search.createColumn({
                    name: "filetype",
                    label: "Type"
                }),
                search.createColumn({
                    name: "formulanumeric",
                    formula: "TO_DATE({today}) - TO_DATE({modified})",
                    label: "Formula (Numeric)"
                })
            ]
        });
        var searchResultCount = fileSearchObj.runPaged().count;
        log.debug("fileSearchObj result count", searchResultCount);
        fileSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results
            try {
                var fileId = result.getValue('internalid');

                file.delete({
                    id: fileId
                });
            } catch (error) {
                log.error('Error while deleting ' + result.getValue('name') + error.name, error);
            }
            return true;
        });

    }

    return {
        execute: execute
    };
});