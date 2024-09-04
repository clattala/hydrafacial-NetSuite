/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 
 * CHN-577 - Change Script log level to errror - Pavan Kaleru
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     */
    (record, runtime, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const savedSearchId = runtime.getCurrentScript().getParameter('custscript_hf_changeloglevel_search');
            if (savedSearchId) {
                const searchObj = search.load({
                    id: savedSearchId
                });
                const allSearchResults = getAllSearchResults(searchObj)
                if (allSearchResults.length > 0) {
                    allSearchResults.forEach(function(result) {
                       log.debug('result' , result)
                        const deploymentRecordId = result.getValue('internalid')
                        log.debug('deploymentRecordId', deploymentRecordId);
                        record.submitFields({
                            type: 'scriptdeployment',
                            id: deploymentRecordId,
                            values: {
                                'loglevel': 'ERROR'
                            },
                            options: {
                                ignoreMandatoryFields: true
                            }
                        });
                                        log.error('governance remaining' , runtime.getCurrentScript().getRemainingUsage());

                    })
                }
            }
        }

        function getAllSearchResults(searchObj) {
            const searchResultCount = searchObj.run()
            var searchResults = [];
            var startIndex = 0;
            const pageSize = 1000; // Number of search results to fetch per page

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


        return {
            execute
        }

    });