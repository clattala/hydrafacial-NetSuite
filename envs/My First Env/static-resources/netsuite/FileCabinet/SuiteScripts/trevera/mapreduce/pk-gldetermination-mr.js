/**
* @NApiVersion 2.1
* @NScriptType mapreducescript
*/

/**
 * Map Reduce script for setting default receivable account on customer record .
 */

define([
    'N/runtime'
    , 'N/search'
    , 'N/record'
    , 'N/error'
], function (
    runtime
    , search
    , record
    , error
) {

    /**
     * default class to handle errors in map/reduce script run process
     */
    class MR_HELPER {

        constructor() {
            log.debug('Initiating MR_HELPER');
        }

        /**
         * handles errors occured in map reduce operation
         * @param {Object} summary map reduce summary object
         * @returns {null}
         */
        handleErrorIfAny(summary) {
            let inputSummary = summary.inputSummary;
            let mapSummary = summary.mapSummary;
            if (inputSummary.error) {
                log.error({ title: 'subroutine::handleErrorIfAny::Input Error', details: inputSummary.error });
                let e = error.create({ name: 'INPUT_STAGE_FAILED', message: inputSummary.error });
                this.handleErrorAndSendNotification(e, 'getInputData');
            }

            this.handleErrorInStage('map', mapSummary);
        }

        /**
         * handles stage errors
         * @param {string} stage map or reduce stage error occured in
         * @param {Object} summary stage summary object
         * @returns {null}
         */
        handleErrorInStage(stage, summary) {
            let errorMsg = [];
            summary.errors.iterator().each(function (key, value, executionNo) {
                errorMsg.push(stage + ' error for key: ' + key + ', execution no  ' + executionNo + '. Error incurred: ' + JSON.parse(value).message + '\n');
                log.error({ title: stage + ' error for key: ' + key + ', execution no  ' + executionNo, details: value });
                return true;
            });

            if (errorMsg.length > 0) {
                let e = error.create({ name: 'PROCESS_FAILED', message: JSON.stringify(errorMsg) });
                this.handleErrorAndSendNotification(e, stage);
            }
        }

        /**
         * handles error
         * @param {Object} E - error object
         * @param {string} stage - map or reduce stage string
         */
        handleErrorAndSendNotification(E, stage) {
            log.error('Stage: ' + stage + ' failed', E);
        }
    }

    const srchCstmrInGlCstmRec = customer => {
        try {
            let isPresent = false;

            search
                .create({
                    type: "customrecord_customer_salesgroup_gldeter",
                    filters:
                        [
                            ["custrecord4", "anyof", customer]
                        ],
                    columns: null
                })
                .run()
                .each(function (result) {
                    isPresent = true;
                    return false;
                });

            log.debug('srchCstmrInGlCstmRec:isPresent', isPresent);
            return isPresent

        } catch (E) {
            log.error('srchCstmrInGlCstmRec:error:', E)
            throw E;
        }
    }

    /**
     * @returns {Array|Object}
     */
    function getInputData() {
        try {
            const scriptObj = runtime.getCurrentScript();
            const salesGrpId = scriptObj.getParameter({ name: "custscript_pk_salesgrp" })
            const receivableAccountId = scriptObj.getParameter({ name: "custscript_pk_recacctid" })
            log.debug('params', { salesGrpId, receivableAccountId });

            return search
                .create({
                    type: "customer",
                    filters:
                        [
                            ["custentity_hf_salesgroup", "anyof", salesGrpId],
                            "AND",
                            ["receivablesaccount", "noneof", receivableAccountId]
                        ],
                });

        } catch (e) {
            log.error('getInputData:Error: ', e);
            throw e;
        }
    }

    function map(context) {
        const { key, value } = context;
        log.audit('map context:: ', { key, value });
        const contextValue = JSON.parse(value);

        //only change customer's default receivable account is no gl determination record related to this customer is present.
        const customerPresentOnGLCstmRec = srchCstmrInGlCstmRec(key);

        if (!customerPresentOnGLCstmRec) {
            const scriptObj = runtime.getCurrentScript();
            const receivableAccountId = scriptObj.getParameter({ name: "custscript_pk_recacctid" })

            const recordCustomer = record.load({ type: record.Type.CUSTOMER, id: key });
            const customerARAccount = recordCustomer.getValue({ fieldId: 'receivablesaccount' });

            if (Number(receivableAccountId) !== Number(customerARAccount)) {
                recordCustomer.setValue({ fieldId: 'receivablesaccount', value: receivableAccountId });
                recordCustomer.save({
                    ignoreMandatoryFields: true
                    , enableSourcing: false
                });
            }
        }

        context.write({ key: context.key, value: !customerPresentOnGLCstmRec })
    }

    /**
     * invoked after all the map/reduce operations have been performed
     * @param {Object} summary summary object returned during map/reduce execution
     */
    function summarize(summary) {
        const newMRSummaryHelper = new MR_HELPER();
        if (summary.isRestarted) { log.audit({ details: 'Summary stage is being restarted!' }); }
        newMRSummaryHelper.handleErrorIfAny(summary);
        log.audit('logSummaryAudit: summary: ', JSON.stringify({ 'seconds': summary.seconds, 'usage': summary.usage, 'yields': summary.yields }))
    }

    return {
        getInputData,
        map,
        summarize
    };
});