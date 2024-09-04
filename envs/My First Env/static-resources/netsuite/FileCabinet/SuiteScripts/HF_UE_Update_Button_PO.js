/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/url'],

    function (record, url) {

        // Define the user event script functions
        function beforeLoad(context) {
            // Check if the execution context is user interface
            if (context.type !== context.UserEventType.VIEW) {
                return;
            }

            // Get the current record object
            var currentRecord = context.newRecord;

            // Get the internal ID of the current record
            var recordId = currentRecord.id;

            // Get the URL of the Suitelet script
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_update_promise_dates',
                deploymentId: 'customdeploy_update_promise_dates',
                params: {
                    po_id: recordId // Pass the record ID as a parameter to the Suitelet
                }
            });

            // Add a button to the form that will open the Suitelet in a new window
            var form = context.form;
            form.addButton({
                id: 'custpage_update_button',
                label: 'Update Latest Promise Date',
                functionName: "window.open('" + suiteletUrl + "', '_blank')"
            });
        }

        // Return the user event script functions
        return {
            beforeLoad: beforeLoad
        };
    });