/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/runtime'],
    function(search,runtime) {

        function beforeLoad(context) {
            try {
                var emailMessageRecord = context.newRecord;
               
                var entityInternalId = context.request.parameters.entity;
                var customerLookUp = customerDetails(entityInternalId);
                                var emailOnRecord = emailMessageRecord.getValue('recipientemail');
                                log.debug('emailonRecord', emailOnRecord);
                                var email = customerLookUp[0].getValue('custentity_hf_default_inv_email');
              log.debug('email', email);
 emailMessageRecord.setValue('recipientemail', email);
              return;
                log.debug('before load is running', context.type)
                log.debug('context', context)
                if (context.type == 'create') {
                    var form = context.form
                    var emailMessageRecord = context.newRecord;
                    log.debug('context.request.url', context.request.url)
                    log.debug('parameters', context.request.parameters)
                    var entityInternalId = context.request.parameters.entity;

                    var transactionId = context.request.parameters.transaction;
                    if (transactionId) {
                        var transactionLookup = search.lookupFields({
                            type: 'transaction',
                            id: transactionId,
                            columns: ['type' , 'subsidiary']
                        });
                        log.debug('transactionLookup', transactionLookup)
                        var transactionType = transactionLookup.type[0].text
                        log.debug('transactionType', transactionType)
                      	var subsidiary = transactionLookup.subsidiary[0].value
                        log.debug('subsidiary' , subsidiary)
                       var scriptObj = runtime.getCurrentScript();
          				var usSubsidiary = scriptObj.getParameter({name: 'custscript_hf_subsidiary'})
                        log.debug('usSubsidairy' ,usSubsidiary )
                        if (transactionType == 'Invoice' && subsidiary==usSubsidiary) {
                            if (entityInternalId) {
                                var customerLookUp = customerDetails(entityInternalId)
                                emailMessageRecord.setValue('recipient', '')
                                var emailOnRecord = emailMessageRecord.getValue('recipientemail');
                                log.debug('emailonRecord', emailOnRecord)
                                var email = customerLookUp[0].getValue('custentity_hf_default_inv_email');
                                log.debug('email in 36', email)
                                var entityId = customerLookUp[0].getValue('entityid');
                                var companyname = customerLookUp[0].getValue('companyname')
                                

                                log.debug('email', email)
                                emailMessageRecord.setValue('recipientemail', email)
                              
                                emailMessageRecord.setValue('subject', 'The Hydrafacial Company : ' + entityId + ' ' + companyname)

                                var client = form.addField({
                                    id: 'custpage_abc_text',
                                    type: 'inlinehtml',
                                    label: 'Text'
                                });
                                var scr = "";
                                scr += 'jQuery("#recipient_fs_lbl").hide();';
                                scr += 'jQuery("#recipient_fs").hide();';
                                //scr += 'jQuery("#template_fs").hide();'




                                //push the script into the field so that it fires and does its handy work
                                client.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"


                            }
                        }
                    }

                }

            } catch (err) {
                log.error('Error in UE Script', JSON.stringify(err));
            }
        }


        function customerDetails(customerInternalId) {
            var customerSearchObj = search.create({
                type: "customer",
                filters: [
                    ["internalidnumber", "equalto", customerInternalId]
                ],
                columns: [
                    search.createColumn({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "ID"
                    }),
                    search.createColumn({
                        name: "custentity_hf_default_inv_email",
                        label: "Email"
                    }),
                    search.createColumn({
                        name: "companyname",
                        label: "Company Name"
                    })
                ]
            });
            var searchResultCount = customerSearchObj.run().getRange({
                start: 0,
                end: 1
            });
            log.debug("customerSearchObj result count", searchResultCount);
            return searchResultCount;

        }
        return {
            beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            //afterSubmit: afterSubmit
        }
    });