/**
 *
 *
 * Version      Date    Author          Notes
 * 1.0          2023    Hemang Dave     The script will update the Warranty registration expiry date when a Credit Memo is created.
 *
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record'],
    function(search, record) {


        function afterSubmit(context) {
            try {
                log.debug('context ' + context.newRecord.id, context.type)
                if (context.type == 'create') {
                    var newRecord = context.newRecord;
                    if (newRecord.type == 'creditmemo') {
                        var recordObj = record.load({
                            type: newRecord.type,
                            id: newRecord.id
                        });
                        setNextDatetoRegistration(recordObj);
                    }
                }
            } catch (error) {
                log.debug('error in afterSubmit' + error.message, error)
            }
        }

        function setNextDatetoRegistration(creditMemo) {
            var claimNumber = creditMemo.getValue('custbody_wrm_claimnumber');
            log.debug('claimNumber', claimNumber)
            if (claimNumber) {
                var warrantyRegistration = getWarrantyRegistration(claimNumber)
                log.debug('warrantyRdegistration', warrantyRegistration)

                var today = creditMemo.getValue('trandate');
                log.debug('today', today)
                var tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                log.debug('tomorrow', tomorrow)
                var id = record.submitFields({
                    type: 'customrecord_wrm_warrantyreg',
                    id: warrantyRegistration,
                    values: {
                        custrecord_wrm_reg_warrantyexpire: tomorrow
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });
            }
        }

        function getWarrantyRegistration(claimNumber) {
            var supportcasesearchObj = search.create({
                type: "supportcase",
                filters: [
                    ["internalidnumber", "equalto", claimNumber]
                ],
                columns: [
                    search.createColumn({
                        name: "custevent_wrm_claim_regno",
                        label: "Warranty Registration No."
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTEVENT_WRM_CLAIM_REGNO",
                        label: "Internal ID"
                    })
                ]
            });
            var warrantyRegistration;
            var searchResultCount = supportcasesearchObj.runPaged().count;
            log.debug("supportcasesearchObj result count", searchResultCount);
            supportcasesearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                warrantyRegistration = result.getValue({
                    name: "internalid",
                    join: "CUSTEVENT_WRM_CLAIM_REGNO"
                })
                return true;
            });
            return warrantyRegistration;
        }

        return {

            afterSubmit: afterSubmit
        }
    });
