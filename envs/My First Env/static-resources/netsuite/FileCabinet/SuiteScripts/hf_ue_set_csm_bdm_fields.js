/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
         * FreshService :  SR-17028 
         * Description	: Added the logic to update the Customer's RTS value based on the RTS on the mapping table
         * Script Owner : Pavan Kaleru
         *********************************************************************************

         * FreshService	:  SR-16746 
         * Description	: Added the logic for germany address related validations
         * Script Owner : Pavan Kaleru - 3/19/2024
         *********************************************************************************

           * FreshService	:  SR-18931 
         * Description	: Added the logic for address1 field validations
         * Script Owner : Pavan Kaleru 
         *********************************************************************************

 */
define(['N/record', 'N/search', 'N/runtime'],
        function(record, search, runtime) {
            function afterSubmit(context) {
                try {
                    log.debug('context.type', context.type);

                    if (context.type === context.UserEventType.EDIT || context.type === context.UserEventType.CREATE) {
                        log.audit('runtime.exectionContext', runtime.executionContext)
                        var recObj = context.newRecord;
                        var recordId = recObj.id;
                        var allowedSubsidiaries = ['6', '11']
                        var customer = record.load({
                            type: recObj.type,
                            id: recordId
                        });
                        var subsidiary = customer.getValue({
                            fieldId: "subsidiary"
                        });
                        log.debug('index', allowedSubsidiaries.indexOf(subsidiary))
                        var isOverride = customer.getValue({
                            fieldId: "custentity_hf_override_auto_csm_bdm_map"
                        });
                        if ((allowedSubsidiaries.indexOf(subsidiary) == -1) || isOverride == true) {
                            log.debug('in  return loop')
                            return;
                        }
                        var excludeFromReport = recObj.getValue('custentity_exclude_from_revenue_report')
                        if (excludeFromReport == true) {
                            emptyTheFields(customer)
                            return;
                        }
                        var salesrep = customer.getValue({
                            fieldId: "salesrep"
                        });

                        var isCorporate = customer.getValue({
                            fieldId: "custentity_hf_corporate"
                        });

                        var shipcountry = customer.getValue({
                            fieldId: "shipcountry"
                        });
                        log.debug('shipcountry', shipcountry)


                        var tailAccount = customer.getValue({
                            fieldId: 'custentity_tail_account'
                        })
                        log.debug('salesrep ' + salesrep, 'subsidiary ' + subsidiary)
                        //Added the condition of 6 (Germany subsidiary)

                        log.debug('contuning the process')
                        var shipzip = customer.getValue({
                            fieldId: "shipzip"
                        });
                        log.debug('36 shipzip', shipzip)
                        log.debug('shipcountry', shipcountry)
                        var charToMatch = 0;
                        var customrecord_hf_csm_bdm_configurationSearchObj = search.create({
                            type: "customrecord_hf_csm_bdm_configuration",
                            filters: [
                                ["formulatext: {custrecord_hf_country_code_config}", "contains", shipcountry],
                                "AND",
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
                        log.debug('customrecord_hf_csm_bdm_configurationSearchObj', JSON.stringify(customrecord_hf_csm_bdm_configurationSearchObj))
                        customrecord_hf_csm_bdm_configurationSearchObj.run().each(function(result) {
                            log.debug('result', result)
                            charToMatch = result.getValue('custrecord_hf_char_to_match_with_postcod');
                            return false;
                        });
                        log.debug('charToMatch 58', charToMatch);
                        if (subsidiary != '11') {
                            log.debug('76', charToMatch)
                            if (charToMatch != 0) {
                                var zip = shipzip.substring(0, charToMatch);
                            } else {
                                var zip = shipzip.substring(0, shipzip.search(/[0-9]/));
                            }
                        } else {
                            try {
                                var zip = shipzip.split(' ')[0]

                            } catch (error) {
                                log.debug('error while spliting', error.message)
                                zip = ''
                            }
                        }
                        log.debug('charToMatch 64', charToMatch)
                        //var zip = shipzip.substring(0, shipzip.search(/[0-9]/));
                        log.debug('zip', zip);

                        if (zip == "") {
                            log.audit('NO zip')
                            emptyTheFields(customer)
                            return;
                        } else {

                            var arr_filters = [];
                            arr_filters.push(search.createFilter({
                                name: "isinactive",
                                operator: search.Operator.IS,
                                values: false
                            }));
                            //var formulaField ='formulatext: '
                            arr_filters.push(search.createFilter({
                                name: 'formulatext',
                                operator: search.Operator.CONTAINS,
                                values: shipcountry,
                                formula: "{custrecord_hf_csm_bdm_country_code}"


                            }));

                            var countriesWithoutZipCode = ['CH', 'AT']
                            var index = countriesWithoutZipCode.indexOf(shipcountry)
                            log.debug('index', index)
                            if (index == -1) {

                                log.debug('countriesWithoutZipCode ', countriesWithoutZipCode)
                                log.debug('not Switzerland or austria')
                                arr_filters.push(search.createFilter({
                                    name: "custrecord_hf_csm_bdm_postcode",
                                    operator: search.Operator.IS,
                                    values: zip.toUpperCase()
                                }));
                            }
                            log.debug('arr_filters', arr_filters)
                            var customrecord_hf_csm_bdm_fieldsSearchObj = search.create({
                                type: "customrecord_hf_csm_bdm_fields",
                                filters: arr_filters,
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_hf_bdm",
                                        label: "HF | BDM"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm",
                                        label: "HF | CSM"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_country",
                                        label: "HF | Country"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_credit_controller",
                                        label: "HF | Credit Controller"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_postcode",
                                        label: "HF | Post Code"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_subsidiary",
                                        label: "HF | Subsidiary"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_sub_region",
                                        label: "HF | Team"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_credit_controller_corporat",
                                        label: "HF | Team"
                                    }),
                                    search.createColumn({
                                        name: "internalid",
                                        label: "internalid"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_rsd",
                                        label: "RSD"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_emea_ibdm",
                                        label: "IBDM"
                                    }),

                                    search.createColumn({
                                        name: "custrecord_hf_csm_territories",
                                        label: "CSM territories"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_csm_bdm_sub_region",
                                        label: "BDM Territories"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_emea_ibdm_region",
                                        label: "IBDM Territories"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_BDM",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_CSM",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_CREDIT_CONTROLLER_CORPORAT",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_CSM_BDM_CREDIT_CONTROLLER",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_EMEA_IBDM",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_RSD",
                                        label: "Inactive"
                                    })

                                    //SR-17028 Start
                                    ,
                                    search.createColumn({
                                        name: "isinactive",
                                        join: "CUSTRECORD_HF_RTS",
                                        label: "Inactive"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_hf_rts",
                                        label: "HF | RTS"
                                    })
                                    //SR-17028 - END



                                ]
                            });
                            log.debug('customrecord_hf_csm_bdm_fieldsSearchObj', customrecord_hf_csm_bdm_fieldsSearchObj)
                            var searchResultCount = customrecord_hf_csm_bdm_fieldsSearchObj.runPaged().count;
                            var results = []
                            customrecord_hf_csm_bdm_fieldsSearchObj.run().each(function(result) {
                                var scmBdmFields = {};
                                scmBdmFields.internalid = result.getValue('internalid')
                                scmBdmFields.bdm = result.getValue('custrecord_hf_bdm');
                                scmBdmFields.csm = result.getValue('custrecord_hf_csm');
                                scmBdmFields.country = result.getValue('custrecord_hf_csm_bdm_country');
                                scmBdmFields.credit_controller = result.getValue('custrecord_hf_csm_bdm_credit_controller');
                                scmBdmFields.postcode = result.getValue('custrecord_hf_csm_bdm_postcode');
                                scmBdmFields.subsidiary = result.getValue('custrecord_hf_csm_bdm_subsidiary');
                                scmBdmFields.Subregion = result.getValue('custrecord_hf_csm_bdm_sub_region');
                                scmBdmFields.csmRegion = result.getValue('custrecord_hf_csm_territories')
                                scmBdmFields.corporateCreditController = result.getValue('custrecord_hf_credit_controller_corporat');
                                scmBdmFields.iBdm = result.getValue('custrecord_hf_emea_ibdm');
                                scmBdmFields.rsd = result.getValue('custrecord_hf_rsd');
                                scmBdmFields.iBdmTerritories = result.getValue('custrecord_hf_emea_ibdm_region');
                                //SR-17028 Start
                                scmBdmFields.rts = result.getValue('custrecord_hf_rts');
                                scmBdmFields.rtsInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_RTS",
                                })
                                //SR-17028- END
                                scmBdmFields.bdmInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_BDM",
                                })
                                scmBdmFields.csmInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_CSM",
                                })
                                scmBdmFields.corporateCreditControllerInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_CREDIT_CONTROLLER_CORPORAT",
                                })
                                scmBdmFields.creditControllerInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_CSM_BDM_CREDIT_CONTROLLER",
                                })
                                scmBdmFields.ibdmInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_EMEA_IBDM",
                                })
                                scmBdmFields.rsdInactive = result.getValue({
                                    name: "isinactive",
                                    join: "CUSTRECORD_HF_RSD",
                                })
                                results.push(scmBdmFields);

                                return true;
                            });
                            log.debug('results', results);
                            log.debug('isCorporate', isCorporate);

                            log.debug('recordId' + recordId, 'type ' + recObj.type)
                            if (results.length > 0) {
                                for (var i = 0; i < results.length; i++) {
                                    try {
                                        var hfCsmBdmMappingFields = results[i];
                                        log.debug('hfCsmBdmMappingFields', hfCsmBdmMappingFields)
                                        if (tailAccount == false && hfCsmBdmMappingFields.bdmInactive == false) {
                                            log.debug('296 bdm', hfCsmBdmMappingFields.bdm)
                                            customer.setValue('custentity_hf_bdm', hfCsmBdmMappingFields.bdm);
                                        }
                                        if (hfCsmBdmMappingFields.rsdInactive == false) {
                                            customer.setValue('custentity_hf_rsd', hfCsmBdmMappingFields.rsd);
                                        }

                                        if (tailAccount == true && hfCsmBdmMappingFields.ibdmInactive == false) {
                                            customer.setValue('custentity_hf_bdm', hfCsmBdmMappingFields.iBdm);
                                        }
                                        if (hfCsmBdmMappingFields.csmInactive == false) {
                                            customer.setValue('salesrep', hfCsmBdmMappingFields.csm);
                                        }
                                        if (tailAccount == false) {
                                            customer.setValue('custentity_hf_subregion', hfCsmBdmMappingFields.Subregion);
                                        }
                                        if (tailAccount == true) {
                                            customer.setValue('custentity_hf_subregion', hfCsmBdmMappingFields.iBdmTerritories);
                                        }
                                        if (isCorporate == false && hfCsmBdmMappingFields.creditControllerInactive == false) {
                                            log.debug('isCorporate if', isCorporate);
                                            //   customer.setValue('custentity_3rd_cre_con',hfCsmBdmMappingFields.credit_controller);
                                            customer.setValue('custentity_3rp_cre_con', hfCsmBdmMappingFields.credit_controller);
                                        }
                                        if (isCorporate == true && hfCsmBdmMappingFields.corporateCreditControllerInactive == false) {
                                            log.debug('isCorporate else', isCorporate);
                                            //   customer.setValue('custentity_3rd_cre_con',hfCsmBdmMappingFields.corporateCreditController);
                                            customer.setValue('custentity_3rp_cre_con', hfCsmBdmMappingFields.corporateCreditController);
                                        }

                                        //SR-17028  Start
                                        if (hfCsmBdmMappingFields.rtsInactive == false) {
                                            customer.setValue('custentity_hf_rts', hfCsmBdmMappingFields.rts);
                                        }
                                        //SR-17028  End
                                        // if (hfCsmBdmMappingFields.csmRegion != '') {
                                        log.debug('csm region is there')

                                        customer.setValue('custentity_hf_emea_csm_region', hfCsmBdmMappingFields.csmRegion);

                                        //}
                                        customer.save({
                                            enableSourcing: true,
                                            ignoreMandatoryFields: true
                                        });
                                    } catch (e) {
                                        log.debug('error', e.message)
                                    }
                                    break;
                                }
                            } else {
                                emptyTheFields(customer)
                                return;
                            }
                        }
                    }
                    return;
                } catch (error) {
                    log.debug('Error in aftersubmit ' + error.message, error)
                }
            }

            //Before Submit function added to set the Category as website and to set the address as default shipping for Online Lead for Germany subsidiary
            function beforeSubmit(context) {
                if (context.type == 'create') {

                    try {


                        if (runtime.executionContext == 'USEREVENT') { //webstore
                            context.newRecord.setValue('category', 5)
                            var lineNumber = context.newRecord.findSublistLineWithValue({
                                sublistId: 'addressbook',
                                fieldId: 'defaultbilling',
                                value: true
                            });
                            if (lineNumber >= 0) {
                                log.debug('164 lineNumber')
                                context.newRecord.setSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'defaultshipping',
                                    value: true,
                                    line: lineNumber
                                });

                                context.newRecord.setSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'defaultbilling',
                                    value: true,
                                    line: lineNumber
                                });
                                log.debug('settign default shipping')
                            }
                        }
                    } catch (error) {
                        log.debug('error in create')
                    }
                }

                //SR-16746 Start replace the below if loop starting from line 392 in production
                if (context.type == 'create' || (context.type == 'edit' && runtime.executionContext != 'MAPREDUCE')) {
                    var customer = context.newRecord;
                    log.debug('customerid ', customer.id)
                    var shipcountry = customer.getValue({
                        fieldId: "shipcountry"
                    });
                    log.debug('shipcountry', shipcountry)
                    log.debug('in loop 349')
                    var shipaddr1 = customer.getValue({
                        fieldId: "shipaddr1"
                    });
                    var shipaddr2 = customer.getValue({
                        fieldId: "shipaddr2"
                    });
                    log.debug('shipaddress2', shipaddr2)

                    log.debug('shipaddr1 ' + shipaddr1)
                    var shipzip = customer.getValue({
                        fieldId: "shipzip"
                    });
                    log.debug('shipzip', shipzip)
                    var shipcity = customer.getValue({
                        fieldId: "shipcity"
                    });

                    var validationCountries = ['IE', 'GB', 'GG', 'JE', 'DE'] //Ireland , United Kingdom , Jersey and Guernsey
                    if (validationCountries.indexOf(shipcountry) != -1) {



                        if (shipaddr1.length == '0' || shipzip.length == '0' || shipcity.length == '0') {
                            throw ' For UK/Ireland/Germany country , Address1 , City , Zip is mandatory. Please enter Address1, City , Zip'
                        }
                        if (shipzip) {
                            var blankPresentInZip = checkSpacePresent(shipzip)
                            if (!blankPresentInZip && shipcountry != 'DE') {
                                throw ' For UK/Ireland country , there should be a space in between for the Zip code. Please enter a proper Zip and save the record'
                            }
                            if (shipcountry == 'DE') {
                                log.debug('shipcountry is DE')
                                shipzip = shipzip.trim() //shipzip = shipzip.replace(/\s/g, "") SR-18931 replaced this line
                                var isZipNumber = completeNumber(shipzip)

                                if (shipzip.length != 5) {
                                    throw 'For Germany Country , there should be minimum 5 digits in zip code field'
                                }


                                var isCompleteNumber = completeNumber(shipzip)
                                log.debug('isCompleteNumber', isCompleteNumber)
                                if (isCompleteNumber == false) {
                                    throw 'For Germany country , there should be 5 digits in the Zip and no spaces in between the digits.'
                                }
                            }
                        }

                        shipaddr1 = shipaddr1.trim() //SR-18931  repalced the line replace(/\s/g, "")
                        shipaddr2 = shipaddr2.replace(/\s/g, "")
                        shipcity = shipcity.replace(/\s/g, "")
                        if (shipcity.length < '3') {
                            throw ' For UK/Ireland/Germany country , there should be minimum 3 characters in City field. Please enter a proper City'
                        }

                        if (shipaddr2.length == '1') {
                            throw ' For For UK/Ireland/Germany country , there should be more than 1 character in Address2 field. Please enter a proper Address2'
                        }
                        if ((shipaddr1.length < '4' && shipcountry == 'DE') || (shipaddr1.length < '5' && shipcountry != 'DE')) {
                           //SR-18931 change the condition of shipaddr1 
                                if (shipcountry == 'DE') {
                                    throw ' For Germany , there should be minimum 4 characters in Address1 field. Please enter a proper Address1'

                                } else {
                                    throw ' For UK/Ireland , there should be minimum 4 characters in Address1 field. Please enter a proper Address1'

                                }
                            }
                            var isshipAddr1Number = completeNumber(shipaddr1)
                            if (completeNumber == true) {
                                throw 'For UK/Ireland/Germany country , you have entered all numbers in address 1 field ,  Please enter a proper Address1'
                            }
                        }

                    }
                    //SR-16746 END

                }


                //SR-16746 add this function  
                function completeNumber(val) {
                    return /^\d+$/.test(val);
                }

                //SR-16746 END
                function checkSpacePresent(str) {
                    var result = str.substring(1, str.length - 1);
                    var isSpacePresent = containsWhitespace(result)
                    log.debug('isSpacePresent', isSpacePresent)
                    return isSpacePresent

                }

                function containsWhitespace(str) {
                    return str.match(/\s/) !== null;
                }

                function emptyTheFields(customer) {
                    try {
                        customer.setValue('custentity_hf_bdm', '');
                        customer.setValue('custentity_hf_rsd', '');
                        customer.setValue('salesrep', '');
                        customer.setValue('custentity_hf_subregion', 46);
                        customer.setValue('custentity_3rp_cre_con', '');
                        customer.setValue('custentity_hf_emea_csm_region', '')
                        customer.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                    } catch (error) {
                        log.error('error while saving ' + error.message, error);
                    }
                }
                return {
                    beforeSubmit: beforeSubmit,
                    afterSubmit: afterSubmit
                }
            }
        );