/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript

 /*********************************************************************************
         * JIRA  		:  CHN-614
         * Description	: Updating the Customer Doctor index present field based on the Contact doctor index if an active contact has a doctor index then the parent Customer should have the doctor index presnt as true and if no contacts has the doctor index then the Customer should have the Doctor index present as false
         * Script Type  : Scheduled
         * Script Owner : Pavan Kaleru
         *********************************************************************************/
       
 
 
define(['N/record', 'N/search', 'N/runtime'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, runtime) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                let scriptObj = runtime.getCurrentScript();
                log.debug('scriptObj ', scriptObj)
                let doctorIndexTrueSearch = scriptObj.getParameter({
                    name: 'custscript_hf_dr_index_true'
                });

                //this search is where doctor index is true but none of the contacts have the doctor index number
                let doctorIndexFalseSearch = scriptObj.getParameter({
                    name: 'custscript_hf_dr_index_false'
                });

                let doctorIndexTrueSearchObj = search.load({
                    id: doctorIndexTrueSearch
                });
                log.debug('doctorIndexTrueSearchObj ', doctorIndexTrueSearchObj)
                doctorIndexTrueSearchObj = getAllSearchResults(doctorIndexTrueSearchObj)
                log.debug('doctorIndexTrueSearchObj', doctorIndexTrueSearchObj)

                let doctorIndexFalseSearchObj = search.load({
                    id: doctorIndexFalseSearch
                });
                doctorIndexFalseSearchObj = getAllSearchResults(doctorIndexFalseSearchObj)
                log.debug('doctor doctorIndexFalseSearchObj', doctorIndexFalseSearchObj)
                // this search is where doctor index is false but atelast one of the contacts has doctor index number
                if (doctorIndexFalseSearchObj.length > 0) {
                    updateTheCustomer(doctorIndexFalseSearchObj , true)
                }
				if (doctorIndexTrueSearchObj.length > 0) {
                    updateTheCustomer(doctorIndexTrueSearchObj , false)
                }
                log.debug('wait')
            } catch (error) {
                log.error('Error in main Function ' + error.message, error)
            }
        }
        function getAllSearchResults(searchObj) {
            var searchResultCount = searchObj.run()
            var searchResults = [];
            var startIndex = 0;
            var pageSize = 1000; // Number of search results to fetch per page
            do {
                // Fetch search results page by page
                var pageResults = searchResultCount.getRange({
                    start: startIndex,
                    end: startIndex + pageSize
                });
                // Add page results to the array
                searchResults = searchResults.concat(pageResults);

                // Update the start index for the next page
                startIndex += pageSize;

            } while (pageResults.length === pageSize);
            return searchResults
        }
		
		function updateTheCustomer(doctorIndexObject , doctorIndexValue){
			for (let i = 0; i < doctorIndexObject.length; i++) {
                        let customerInternalId = doctorIndexObject[i].getValue(doctorIndexObject[0].columns[0])
                        let customerName = doctorIndexObject[i].getValue(doctorIndexObject[0].columns[1])
                        log.debug('customerInternalId', customerInternalId)
                        log.debug('customerName', customerName)
						submitCustomerRecord(customerInternalId , doctorIndexValue);
                    }
		}
		
		function submitCustomerRecord(customerId , doctorIndexValue){
			record.submitFields({
                    type: 'customer',
                    id: customerId,
                    values: {
						custentity_hf_dr_index_present: doctorIndexValue
					},
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
		}
		
        return {
            execute
        }

    });