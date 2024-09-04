/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/email'],

    function(record, search, runtime, email) {
        var oldCsm, oldBdm, newCsm, newBdm, zipCode
        var noOfCharacters = {}
        var countriesWithoutZipCode = ['CH', 'AT']


        function getInputData() {
            var title = " getInputData()";
            log.debug(title, "<------------------ M/R SCRIPT START ------------------>");
            try {
                //getParameters()
                noOfCharacters = getZipCodes()
                log.debug('noOfCharacters in 17 ', noOfCharacters)

                var customrecord_hf_csm_bdm_fieldsSearchObj = search.create({
                    type: "customrecord_hf_csm_bdm_fields",
                    filters: [
                        ["custrecord_hf_update_customers", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_hf_csm_bdm_subsidiary",
                            label: "HF | Subsidiary"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_csm_bdm_postcode",
                            label: "HF | Post Code"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_csm",
                            label: "HF | CSM"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_bdm",
                            label: "HF | BDM"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_csm_bdm_country_code",
                            label: "HF | BDM"
                        }),

                    ]
                });
                // var csmBdmSearch = customrecord_hf_csm_bdm_fieldsSearchObj.run();
                return getAllSearchResults(customrecord_hf_csm_bdm_fieldsSearchObj)

                /*log.debug('oldCsm' + oldCsm, 'oldBdm' + oldBdm)
                var arr_filters = getFilters(zipCode,subsidiary)
                log.debug('arr_filters', arr_filters)
                var searchObj = searchCustomers(arr_filters)
                log.debug('searchObj', searchObj.length)
                return searchObj;*/

            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }

        function searchCustomers(arr_filters) {
            var customerSearchObj = search.create({
                type: "customer",
                filters: arr_filters,
                columns: [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "internalid"
                    }),
                    search.createColumn({
                        name: "salesrep",

                        label: "salesrep"
                    }),
                    search.createColumn({
                        name: "custentity_hf_bdm",

                        label: "bdm"
                    }),

                ]
            });
            var searchResults = getAllSearchResults(customerSearchObj)
            return searchResults;

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

        function map(context) {
            var title = " map() ";
            try {
                if (Object.keys(noOfCharacters).length == 0) {
                    log.error('Empty')
                    noOfCharacters = getZipCodes()
                }
                var arr_filters
                var dataObj = JSON.parse(context.value);
                var customRecordId = dataObj.id
                log.debug(title + "dataObj", dataObj);
                var valuesObj = dataObj.values
                var subsidiary = valuesObj.custrecord_hf_csm_bdm_subsidiary[0].value
                var zipCode = valuesObj.custrecord_hf_csm_bdm_postcode
                var country = valuesObj.custrecord_hf_csm_bdm_country_code[0].text
                var noOfCharactersToMatch = noOfCharacters[country]
                //log.debug('noOfCharactersToMatch', noOfCharactersToMatch)
                var index = countriesWithoutZipCode.indexOf(country)

                //log.debug('index', index)
                if (index == -1) {
                    var zip = zipCode.substring(0, noOfCharactersToMatch);
                    arr_filters = getFilters(zip, subsidiary)
                } else {
                    arr_filters = getFilters(null, subsidiary, country)
                }
                var searchObj = searchCustomers(arr_filters)
                var customerInternalId;
                var noOfCustomers = searchObj.length
                //log.audit('noOfCustomers' + noOfCustomers, customRecordId)
                if (noOfCustomers == 0) {
                    var fieldJson = {
                        'custrecord_hf_update_customers': false
                    }
                    submitFields('customrecord_hf_csm_bdm_fields', customRecordId, fieldJson)

                } else {
                    for (var i = 0; i < noOfCustomers; i++) {
                        customerInternalId = searchObj[i].getValue('internalid');
                        //log.debug('customerInternalId', customerInternalId)
                        context.write({
                            key: customerInternalId,
                            value: customRecordId
                        })
                    }
                }
                //}
            } catch (e) {
                log.error("ERROR IN" + title, e);
            }
        }

        function reduce(context) {
            try {
                var internalId = context.key;
                var customRecordId = context.values

                var customerRecord = record.load({
                    type: 'customer',
                    id: internalId,
                })
                customerRecord.save({
                    ignoreMandatoryFields: true
                })
                log.debug('customRecordID in reduce ' + customRecordId, context)
                for (var i = 0; i < customRecordId.length; i++) {
                    context.write({
                        key: customRecordId[i],
                        value: customRecordId[i]
                    })
                }


                //submitFields('customer', internalId, fieldJson)

                // context.write(customRecordId, internalId)

            } catch (error) {
                log.error('error in reduce', error.message)
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
            log.debug('noOfCharacters in map', noOfCharacters)
            var totalRecordsUpdated = 0;
            var arr_CustomRecordIds = []
            var mapKeys = []
            var mapValues = [];
            log.debug('summary', summary)
            log.debug('summary.inputSummary', summary.inputSummary)
            log.debug('summary', summary)
            log.debug('summary.output ', summary.output)
            /*
          summary.mapSummary.keys.iterator().each(function (key , value)
    {
        mapKeys.push(key);
       mapValues.push(value)
        return true;
    });
log.audit('MAP keys processed', mapKeys);
          log.debug('mapvales' , mapValues)
          var reduceKeys = [];
          var reduceValues = []
          summary.reduceSummary.keys.iterator().each(function (key, value)
    {
        log.error('Reduce Error for key: ' + key, value);
      reduceKeys.push(key)
      reduceValues.push(value)
        return true;
    });
          log.debug('summary.inputSummary',summary.inputSummary)
          log.debug('reduckeeys ', reduceKeys)
          log.debug('reduceValues' , reduceValues)*/
            summary.output.iterator().each(function(key, value) {
                log.debug(' key is ' + key, 'value is ' + value)

                totalRecordsUpdated++;
                arr_CustomRecordIds.push(key)
                return true;
            });
            var fieldJson = {
                'custrecord_hf_update_customers': false
            }
            log.debug('arr_CustomRecordIds.length ', arr_CustomRecordIds.length)
            arr_CustomRecordIds = arr_CustomRecordIds.filter(onlyUnique)
            log.debug('after arr', arr_CustomRecordIds.length)

            for (var i = 0; i < arr_CustomRecordIds.length; i++) {
                submitFields('customrecord_hf_csm_bdm_fields', arr_CustomRecordIds[i], fieldJson)
                //      log.error('governance remaining' , runtime.getCurrentScript().getRemainingUsage());

            }

            log.error('total no of records updated are ' + arr_CustomRecordIds.length);



        }

        function getParameters() {

            var scriptObj = runtime.getCurrentScript()

            zipCode = scriptObj.getParameter({
                name: 'custscript_hf_post_code'
            });
            subsidiary = scriptObj.getParameter({
                name: 'custscript_hf_cust_subsidiary'
            });
            return {

                zipCode,
                subsidiary
            }
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

        function getFilters(zipCode, subsidiary, countryCode) {
            var filters = []
            if (zipCode) {
                filters = [
                    ["zipcode", "startswith", zipCode],
                    "AND",
                    ["subsidiary", "anyof", subsidiary],
                    "AND",
                    ["custentity_hf_override_auto_csm_bdm_map", "is", "F"]
                ];
            } else {
                filters = [
                    ["country", "anyof", countryCode],
                    "AND",
                    ["subsidiary", "anyof", subsidiary],
                    "AND",
                    ["custentity_hf_override_auto_csm_bdm_map", "is", "F"]
                ]
            }

            //log.debug('filters', filters)
            return filters;

        }

        function getZipCodes() {
            var customrecord_hf_csm_bdm_configurationSearchObj = search.create({
                type: "customrecord_hf_csm_bdm_configuration",
                filters: [
                    ["isinactive", "is", "F"]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord_hf_country_code_config",
                        label: "HF | Country Code"
                    }),
                    search.createColumn({
                        name: "custrecord_hf_char_to_match_with_postcod",
                        label: "HF | Characters To Match With Post Code"
                    })
                ]
            });
            var searchResultCount = customrecord_hf_csm_bdm_configurationSearchObj.runPaged().count;
            log.debug("customrecord_hf_csm_bdm_configurationSearchObj result count", searchResultCount);
            customrecord_hf_csm_bdm_configurationSearchObj.run().each(function(result) {
                var countryCode = result.getText('custrecord_hf_country_code_config')
                var postCode = result.getValue('custrecord_hf_char_to_match_with_postcod')
                noOfCharacters[countryCode] = postCode
                return true;
            });
            log.debug('373 ', noOfCharacters)
            return noOfCharacters;


        }

        function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        }
        return {
            getInputData,
            map,
            reduce,
            summarize
        }
    }
);