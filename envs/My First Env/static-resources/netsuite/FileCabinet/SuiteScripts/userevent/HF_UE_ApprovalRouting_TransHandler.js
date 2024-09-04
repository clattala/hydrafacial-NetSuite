/**
 *
 * HF_UE_ApprovalRouting_TransHandler.js
 *
 * Description:
 * Provides an interface
 *
 * Version      Date            Author          Notes
 * 1.0          2021 Jul 06     cfrancisco      Initial version
 *
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/url', 'N/search', 'N/runtime', '../library/HF_LIB_GeneralHelpers', '../library/HF_LIB_ApprovalRouting', 'N/record'],
    function (SERVERWIDGET, URL, SEARCH, RUNTIME, LIB_GENHELPERS, LIB_APPROVALROUTING, RECORD) {
        const HELPERS = LIB_GENHELPERS.INITIALIZE();
        const { _RECORDS, _HELPERS, _SCRIPTS } = LIB_APPROVALROUTING;

        const runtimeUser = RUNTIME.getCurrentUser();

        const __CONFIG = {
            UI_HIDDEN_JS_FIELD_SHOWREJECTSL: {
                id: 'custpage_js_showrejectsl',
                type: 'inlinehtml',
                label: 'Inline JS Field SHOW REJECT SL',
            },
            BUTTON_SHOWREJECTSL: {
                id: 'custpage_appr_showrejectsl',
                label: 'Reject',
                functionName: 'showTransRejectionSL'
            },
        }

        function srchFiles(id) {
            let filePresent = false;
            const searchCols = {
                fileIdMax: search
                    .createColumn({
                        name: "internalid",
                        join: "file",
                        summary: "MAX",
                        sort: search.Sort.ASC
                    })
                , docnumber: search
                    .createColumn({
                        name: "tranid",
                        summary: "GROUP",
                    })
            }

            search
                .create({
                    type: "transaction",
                    filters:
                        [
                            ["approvalstatus", "anyof", "1"],
                            "AND",
                            ["status", "noneof", "Journal:B"],
                            "AND",
                            ["internalid", "anyof", id]
                        ],
                    columns:
                        [
                            searchCols.fileIdMax, searchCols.docnumber
                        ]
                }).run()
                .each(function (result) {
                    filePresent = Boolean(Number(result.getValue(searchCols.fileIdMax)))
                    return true;
                });

            return filePresent;
        }

        function beforeLoad(context) {
            beforeLoad_prepareUi(context);
            const { form, newRecord } = context;

            switch (newRecord.type) {
                case RECORD.Type.INTER_COMPANY_JOURNAL_ENTRY:
                case RECORD.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY:
                case RECORD.Type.JOURNAL_ENTRY:
                    if (!filePresent) {
                        form
                            .addPageInitMessage({
                                type: message.Type.WARNING
                                , title: 'FILES ABSENT'
                                , message: 'Please edit and select the file to see Submit for Approval'
                            });

                        form.removeButton({ id: 'custpageworkflow807' });
                    }
                    break;
                default:
                    break;
            }

        }

        const beforeLoad_prepareUi = (context) => {
            const { type, newRecord, form } = context;

            const __FX_CONFIG = {
                ALLOWED_CONTEXTS: ['view']
            }

            if (__FX_CONFIG.ALLOWED_CONTEXTS.indexOf(type) < 0) { return; }

            let arrGroupApprovers = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.grpapprovers }) || [];
            let intCreatedBy = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.createdby }) || '';
            let intApprovalStatus = newRecord.getValue({ fieldId: _RECORDS.TRANSACTION.FIELDS.approvalstatus });

            let stUserId = String(runtimeUser.id), stCreatedBy = String(intCreatedBy);

            if (stUserId != stCreatedBy && arrGroupApprovers.indexOf(stUserId) >= 0 && intApprovalStatus == _RECORDS.APPROVAL_STATUS.PENDING_APPROVAL) {
                let fldShowRejectHTMLJS = form.addField(__CONFIG.UI_HIDDEN_JS_FIELD_SHOWREJECTSL);
                let stHTMLFieldJS = generateInlineHTMLJS_showRejectionSL(newRecord);
                fldShowRejectHTMLJS.defaultValue = stHTMLFieldJS;

                form.addButton(__CONFIG.BUTTON_SHOWREJECTSL);
            }
        }

        const generateInlineHTMLJS_showRejectionSL = (transRec) => {
            const stLogTitle = 'generateInlineHTMLJS_showRejectionSL';

            let stJS = '';

            let stRejectSLUrl = URL.resolveScript({
                scriptId: _SCRIPTS.SL_REJECT_TRANS.scriptId,
                deploymentId: _SCRIPTS.SL_REJECT_TRANS.deploymentId,
                params: {
                    custparam_transtype: transRec.type,
                    custparam_transid: transRec.id,
                }
            });

            stJS = `<script>
        var childWindow;
        function showTransRejectionSL() {
            var stRequestUrl = '${stRejectSLUrl}';
            var intHeight = window.screen.availHeight * window.devicePixelRatio / 2,
                intWidth = window.screen.availWidth * window.devicePixelRatio / 2;
            var intLeft = window.screen.availWidth * window.devicePixelRatio / 4,
                intTop = window.screen.availHeight * window.devicePixelRatio / 4;
            if (childWindow == null || childWindow.closed) {
                childWindow = window.open(stRequestUrl, '_blank', "location=no,height="+intHeight
                    +",width=" + intWidth +
                    ",left=" + intLeft +
                    ",top=" + intTop );
            }
            else {
                childWindow.focus();
            }
        }
        </script>`;

            return stJS;

        }

        function beforeSubmit(context) {

        }

        function afterSubmit(context) {

        }

        return {
            beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            // afterSubmit: afterSubmit
        }
    });