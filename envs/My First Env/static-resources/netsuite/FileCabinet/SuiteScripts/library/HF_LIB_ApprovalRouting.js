/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 *
 * HF_LIB_ApprovalRouting.js
 *
 * Author: cfrancisco
 *
 * Modifications
 *
 * Version      Date            Author          Notes
 * 1.0          2021-06-03      cfrancisco      Initial version
 * 2.0          2024-07-10      Ayush Gehalot   CNH-524
 *
*/
define(['N/search', './HF_LIB_GeneralHelpers'], function (SEARCH, LIB_GENHELPERS) {
    var HELPERS = LIB_GENHELPERS.INITIALIZE();

    var RECORDS = {
        APPROVAL_GROUP: {
            id: 'customrecord_hf_approvalgroup',
            FIELDS: {
                transtype: 'custrecord_hf_apprgrp_transtype',
                subsidiary: 'custrecord_hf_apprgrp_subsidiary',
                requestors: 'custrecord_hf_apprgrp_requestors',
                approvers: 'custrecord_hf_apprgrp_approvers',
                notifyusers: 'custrecord_hf_apprgrp_notifyusers'
            }
        },
        TRANSACTION: {
            FIELDS: {
                approvalstatus: 'approvalstatus',
                subsidiary: 'subsidiary',
                createdby: 'custbody_hf_appr_createdby',
                editedby: 'custbody_hf_appr_editedby',
                appgroup: 'custbody_hf_appr_apprgroup',
                grpapprovers: 'custbody_hf_appr_grpapprovers',
                approvedby: 'custbody_hf_appr_approvedby',
                remarks: 'custbody_hf_appr_appremarks',
                trigreject: 'custbody_hf_appr_triggerreject',
            }
        },
        TRANSACTION_TYPES: {
            'journalentry': 1,
            'advintercompanyjournalentry': 1,
            'creditmemo': 10,
        },
        APPROVAL_STATUS: {
            PENDING_APPROVAL: 1,
            APPROVED: 2,
            REJECTED: 3
        }
    };

    var SCRIPTS = {
        SL_REJECT_TRANS: { scriptId: 'customscript_hf_sl_appr_rejectransui', deploymentId: 'customdeploy_hf_sl_appr_rejectransui' }
    }

    var _HELPERS = {};
    _HELPERS.getRequestorApprGroup = function (options) {
        var stLogTitle = 'getRequestorApprGroup';


        var APPROVAL_GROUP = RECORDS.APPROVAL_GROUP;
        var objReturn = {};

        try {
            var requestor = options.requestor, transType = options.transType;
            var intTransTypeId = RECORDS.TRANSACTION_TYPES[transType] || '';

            if (intTransTypeId == '') {
                throw 'Transaction type "' + transType + '" is not mapped.';
            }

            var ssAppGroup = SEARCH.create({
                type: APPROVAL_GROUP.id,
                filters: [
                    [APPROVAL_GROUP.FIELDS.requestors, 'anyof', requestor],
                    'AND',
                    [APPROVAL_GROUP.FIELDS.transtype, 'anyof', intTransTypeId],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
                columns: [
                    SEARCH.createColumn({ name: "internalid", label: "Internal ID" }),
                    SEARCH.createColumn({
                        name: "name",
                        sort: SEARCH.Sort.ASC,
                        label: "Name"
                    }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.transtype }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.approvers }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.requestors }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.notifyusers })
                ]
            });

            var arrResults = HELPERS.returnSearchResults(ssAppGroup, 1);

            if (arrResults.length > 0) {
                var results = arrResults[0];

                ssAppGroup.columns.forEach(function (col) {
                    objReturn[col.name] = results.getValue(col);
                    return true;
                });
            }
        }
        catch (ex) {
            var stErrorMsg = HELPERS.getErrorMessage(ex);
            log.error(stLogTitle, stErrorMsg);
        }

        return objReturn;
    }

    _HELPERS.getTransSubAppGroup = function (options) {
        var stLogTitle = 'getTransSubAppGroup';


        var APPROVAL_GROUP = RECORDS.APPROVAL_GROUP;
        var objReturn = {};

        try {
            var subsidiary = options.subsidiary, transType = options.transType;
            var intTransTypeId = RECORDS.TRANSACTION_TYPES[transType] || '';

            if (intTransTypeId == '') {
                throw 'Transaction type "' + transType + '" is not mapped.';
            }

            var ssAppGroup = SEARCH.create({
                type: APPROVAL_GROUP.id,
                filters: [
                    [APPROVAL_GROUP.FIELDS.subsidiary, 'anyof', subsidiary],
                    'AND',
                    [APPROVAL_GROUP.FIELDS.transtype, 'anyof', intTransTypeId],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
                columns: [
                    SEARCH.createColumn({ name: "internalid", label: "Internal ID" }),
                    SEARCH.createColumn({
                        name: "name",
                        sort: SEARCH.Sort.ASC,
                        label: "Name"
                    }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.transtype }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.approvers }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.requestors }),
                    SEARCH.createColumn({ name: APPROVAL_GROUP.FIELDS.notifyusers })
                ]
            });

            var arrResults = HELPERS.returnSearchResults(ssAppGroup, 1);

            if (arrResults.length > 0) {
                var results = arrResults[0];

                ssAppGroup.columns.forEach(function (col) {
                    objReturn[col.name] = results.getValue(col);
                    return true;
                });
            }
        }
        catch (ex) {
            var stErrorMsg = HELPERS.getErrorMessage(ex);
            log.error(stLogTitle, stErrorMsg);
        }

        return objReturn;
    }

    return {
        _RECORDS: RECORDS,
        _HELPERS: _HELPERS,
        _SCRIPTS: SCRIPTS
    }

});