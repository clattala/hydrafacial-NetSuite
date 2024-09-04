/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function(search, record) {
    function afterSubmit(context) {
        try {
            if (context.type != 'delete') {
                var leadRecord = context.newRecord
                leadRecord = record.load({
                  type: leadRecord.type,
                  id : leadRecord.id
                })
                var entitystatus = leadRecord.getValue('entitystatus')
                if (entitystatus != '35') {
                    return;
                }
                var purchaseTime = leadRecord.getValue('custentity_online_form_purchase_time')
                var sizeLocation = leadRecord.getValue('custentity_online_form_size_location')
                var deviceType = leadRecord.getValue('custentity_online_form_device_type_info')
                var treatmentPricing = leadRecord.getValue('custentity_online_form_treatment_pricing')
                var budgetOptions = leadRecord.getValue('custentity_online_form_budget_options')
                if (purchaseTime && treatmentPricing) {
                    log.debug('in 20')
                    var priority = getPriority(purchaseTime, treatmentPricing)
                    log.debug('priority', priority);
                    if (priority == '3' || priority == '1' || priority == '2') {
                        leadRecord.setValue('custentity_hf_lead_priority', priority)
                        //leadRecord.setValue('entitystatus', 31)
                    } else {
                        leadRecord.setValue('custentity_hf_lead_priority', '')
                    }
                  leadRecord.save();
                }
            }
        } catch (error) {
            log.debug('error in beforeSubmit', error.message)

        }
    }

    function getPriority(purchaseTime, treatmentPricing) {
        var customrecord_hf_auto_lead_qualificationSearchObj = search.create({
            type: "customrecord_hf_auto_lead_qualification",
            filters: [
                ["custrecord_hf_looking_for", "anyof", purchaseTime],
                "AND",
                ["custrecord_hf__online_form_treatment", "anyof", treatmentPricing]
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_hf_lead_priority",
                    label: "Lead Priority"
                })
            ]
        });
        var searchResultCount = customrecord_hf_auto_lead_qualificationSearchObj.runPaged().count;
        log.debug("customrecord_hf_auto_lead_qualificationSearchObj result count", searchResultCount);
        var leadPriority;
        customrecord_hf_auto_lead_qualificationSearchObj.run().each(function(result) {
            // .run().each has a limit of 4,000 results 
            leadPriority = result.getValue('custrecord_hf_lead_priority');
            return false;
        });
        return leadPriority;

    }

    return {
         //beforeSubmit:beforeSubmit
        afterSubmit: afterSubmit,
    };
});