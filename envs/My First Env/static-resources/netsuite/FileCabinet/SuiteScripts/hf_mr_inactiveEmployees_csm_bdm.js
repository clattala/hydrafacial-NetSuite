/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/email'],

    function(record, search, runtime, email) {
        var activeUKEmployee, activeDEEmployee

        function getInputData() {
            var title = " getInputData()";
            log.debug(title, "<------------------ M/R SCRIPT START ------------------>");
            try {
                getParameters()
                log.debug('activeUKEmployee get impiut ', activeUKEmployee)
                log.debug('activeDEEmployee get input', activeDEEmployee)
                return search.load({
                    id: 'customsearch_hf_inactive_csm_bdm'
                })

            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }


        function map(context) {
            var title = " map() ";
            try {
                var fieldJson = {}

                var dataObj = JSON.parse(context.value);
                var customRecordId = dataObj.id
                log.debug('customRecordId', customRecordId)
                log.debug(title + "dataObj", dataObj);
                var valuesObj = dataObj.values
                log.debug('valuesObj', valuesObj)
                var bdmInactive = valuesObj['isinactive.CUSTRECORD_HF_BDM']
                var csmInactive = valuesObj['isinactive.CUSTRECORD_HF_CSM']
                var corporateInactive = valuesObj['isinactive.CUSTRECORD_HF_CREDIT_CONTROLLER_CORPORAT']
                var creditControllerInactive = valuesObj['isinactive.CUSTRECORD_HF_CSM_BDM_CREDIT_CONTROLLER']
                var iBdmInactive = valuesObj['isinactive.CUSTRECORD_HF_EMEA_IBDM']
                var rsdInactive = valuesObj['isinactive.CUSTRECORD_HF_RSD']
                var subsidiary = valuesObj.custrecord_hf_csm_bdm_subsidiary.value
                log.debug('subsidiary', subsidiary)
                log.debug('bdmInactive', bdmInactive)
                log.debug('csmInactive', csmInactive)
                log.debug('corporateInactive', corporateInactive)
                log.debug('creditControllerInactive', creditControllerInactive)
                log.debug('iBdmInactive', iBdmInactive)
                if (!activeDEEmployee || activeUKEmployee) {
                    getParameters()
                }
                var inactiveJson = {}
                var replaceEmployee
                if (subsidiary == '11') { //UK
                    replaceEmployee = activeUKEmployee

                } else if (subsidiary == '6') { //German
                    log.debug('subsidiary is german ')
                    replaceEmployee = activeDEEmployee
                }
                log.debug('replaceEmployee', replaceEmployee)
                if (bdmInactive == 'T') {
                    inactiveJson.custrecord_hf_bdm = replaceEmployee
                }
                if (csmInactive == 'T') {
                    inactiveJson.custrecord_hf_csm = replaceEmployee
                }
                if (corporateInactive == 'T') {
                    log.debug('62 corporate is inactive')
                    inactiveJson['custrecord_hf_credit_controller_corporat'] = replaceEmployee
                    log.debug('inactiveJson', inactiveJson)
                }
                if (creditControllerInactive == 'T') {
                    log.debug('65 credit controller is inactive')
                    inactiveJson['custrecord_hf_csm_bdm_credit_controller'] = replaceEmployee
                }
                if (iBdmInactive == 'T') {
                    inactiveJson.custrecord_hf_emea_ibdm = replaceEmployee
                }
                if (rsdInactive == 'T') {
                    inactiveJson.custrecord_hf_rsd = replaceEmployee
                }
                log.debug('inactiveJson', inactiveJson)
                submitFields('customrecord_hf_csm_bdm_fields', customRecordId, inactiveJson)
                /*if (Object.keys(fieldJson).length > 0) {
                    try {
                        submitFields('customer', internalId, fieldJson)
                        context.write(internalId, internalId)
                    } catch (error) {
                        retryLogic('customer', internalId, fieldJson)
                    }
                }*/
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }

        function submitFields(type, internalId, valueJson) {


            record.submitFields({
                type: type,
                id: internalId,
                values: valueJson,
                options: {
                    ignoreMandatoryFields: true
                }
            });
        }

        function retryLogic(type, internalId, valueJson) {
            var maxRetryCount = 3;
            var currentRetryCount = 0;

            while (currentRetryCount < maxRetryCount) {
                try {
                    // Execute the function
                    record.submitFields({
                        type: type,
                        id: internalId,
                        values: valueJson
                    });
                    // If execution is successful, break out of the loop
                    break;
                } catch (e) {
                    // Log the error
                    log.debug('Error:', e);
                    // Increment the retry count
                    currentRetryCount++;
                    // Log the retry attempt
                    log.debug('Retry attempt:', currentRetryCount);
                }
            }
            if (currentRetryCount >= maxRetryCount) {
                log.debug('Retry limit reached. Exiting.');
            }
        }

        function getValue(fieldId, dataObj) {
            if (!isEmpty(dataObj.values[fieldId])) {
                return dataObj.values[fieldId][0].value
            }
            return;
        }

        function summarize(summary) {
            var totalRecordsUpdated = 0;
            // If the number of key/value pairs is expected to be manageable, log
            // each one.
            summary.output.iterator().each(function(key, value) {
                totalRecordsUpdated++;
                return true;
            });
            var errorObjects = 0
            summary.mapSummary.errors.iterator().each(
                function(key, error, executionNo) {
                    var errorObject = JSON.parse(error);
                    /*log.error({
                           title: ' Map error for key: ' + key ,
                        details: errorObject.name + ': ' + errorObject.message
                    });*/
                    errorObjects++
                    return true;
                }
            );
            /*var emailMessage = 'CSM /BDM is Updated by the script ' + 'The no of records processed are ' + totalRecordsUpdated + ' The error records are ' + errorObjects
            var scriptObj = runtime.getCurrentScript()
            var sendEmail = scriptObj.getParameter({
                name: 'custscript_hf_send_email'
            });
            email.send({
                author: 21,
                recipients: sendEmail,
                subject: 'Update of CSM /BDM is done',
                body: emailMessage
            });*/
        }

        function isEmpty(value) {
            // Check if the value is null or undefined
            if (value === null || value === undefined) {
                return true;
            }
            // Check if the value is an empty string
            if (typeof value === 'string' && value.trim() === '') {
                return true;
            }
            // Check if the value is an empty array
            if (Array.isArray(value) && value.length === 0) {
                return true;
            }
            // Check if the value is an empty object
            if (typeof value === 'object' && Object.keys(value).length === 0) {
                return true;
            }
            return false;
        }

        function getParameters() {

            var scriptObj = runtime.getCurrentScript();
            activeUKEmployee = scriptObj.getParameter({
                name: 'custscript_hf_active_uk_employee'
            });
            activeDEEmployee = scriptObj.getParameter({
                name: 'custscript_hf_de_active_employee'
            });
            log.debug('activeUKEmployee', activeUKEmployee)
            log.debug('activeDEEmployee', activeDEEmployee)
            return {
                activeUKEmployee,
                activeDEEmployee
            }
        }

        return {
            getInputData,
            map,
            summarize
        }
    }
);