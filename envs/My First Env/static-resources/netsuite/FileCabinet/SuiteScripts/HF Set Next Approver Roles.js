/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {

    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var currentUserRole = runtime.getCurrentScript().getParameter('custscript_hf_user_role');
        var currentLevel = runtime.getCurrentScript().getParameter('custscript_hf_current_level');
        var newRecord = scriptContext.newRecord;
        var type = newRecord.type;
        var vbSubsidiary = newRecord.getValue('subsidiary');
        var nextApproverLevel;
        if (currentUserRole && currentUserRole!= 3) {
            nextApproverLevel = returnApproverLevel(currentUserRole, null, vbSubsidiary);
        }
        if (!nextApproverLevel) {
            nextApproverLevel = returnApproverLevel(null, currentLevel, vbSubsidiary);
        }
        nextApproverLevel = nextApproverLevel ? nextApproverLevel : currentLevel;
        return nextApproverLevel;

    }

    function returnApproverLevel(userRole, currentLevel, vbSubsidiary) {

        var lineNum = 0;
        var customrecord_hf_vb_approver_limit_roleSearchObj = search.create({
            type: "customrecord_hf_vb_approver_limit_role",
            filters: [
                ["custrecord_hf_vb_subsidiary", "anyof", vbSubsidiary]
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_hf_approver_level",
                    label: "Level",
                    sort: search.Sort.ASC
                }),
                search.createColumn({
                    name: "custrecord_hf_approver_limit",
                    label: "Approver Limit"
                }),
                search.createColumn({
                    name: "custrecord_hf_approver_role",
                    label: "Approver Role"
                }),
                search.createColumn({
                    name: "custrecord_hf_vb_subsidiary",
                    label: "Subsidiary"
                })
            ]
        });
        if (currentLevel) {
            customrecord_hf_vb_approver_limit_roleSearchObj.filters.push(search.createFilter({
                name: 'custrecord_hf_approver_level',
                operator: 'greaterthan',
                values: currentLevel
            }));

        }
        if (userRole) {

            customrecord_hf_vb_approver_limit_roleSearchObj.filters.push(search.createFilter({
                name: 'custrecord_hf_approver_role',
                operator: 'anyof',
                values: userRole
            }));

        }

        var searchResults = customrecord_hf_vb_approver_limit_roleSearchObj.run().getRange(0, 1000);
        if (searchResults.length > 0) {
            return searchResults[0].id;

        } else {
            return '';
        }




    }

    return {
        onAction: onAction
    };
});