          /**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/search'], (search) => {
    function beforeSubmit(scriptContext) {
        try {
           if(scriptContext.type=='create'){
            const newRecord = scriptContext.newRecord;
			const subject = newRecord.getValue('title');
			log.debug('subject' , subject)
			const customerId = newRecord.getValue('company');
			log.debug('comapny' , customerId);
            if(customerId){
              const customerObj = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customerId,
                    columns: ['entityid', 'companyname']
                });
               const entityId = customerObj.entityid;
               log.debug('entityId' , entityId)
               const companyName = customerObj.companyname
               log.debug('comapnyName' , companyName)
              log.debug('entityId', entityId)
              
              let completeEntityId = entityId + ' ' + companyName + ' ' + subject 
              completeEntityId = completeEntityId.substring(0,100)
              
              newRecord.setValue('title', completeEntityId)
              
            }
			
			}
           
            
        } catch(error) {
            log.error({
                title: 'beforeSubmit',
                details: error.message
            });
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
}); 

        