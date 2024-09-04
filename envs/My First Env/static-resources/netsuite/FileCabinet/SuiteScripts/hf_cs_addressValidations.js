/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 
         * FreshService	:  SR-16746 
         * Description	: Added the logic for germany address related validations
         * Script Owner : Pavan Kaleru - 3/19/2024
         *********************************************************************************
           * FreshService	:  SR-18931 
         * Description	: Added the logic for address1 field validations
         * Script Owner : Pavan Kaleru 
         *********************************************************************************
 */
define(['N/currentRecord'],
    function(currentRecord) {

        function validateField(context) {
            try {
                var addressRecord = currentRecord.get();
                var fieldId = context.fieldId;
                console.log('fieldId', fieldId)
                if (fieldId == 'zip' || fieldId == 'country') {
                    var result = throwAlert(addressRecord)
                    return result;
                }
                if (fieldId == 'addr1') {
                    var shipaddr1 = addressRecord.getValue('addr1')
                    shipaddr1 = shipaddr1.trim()
                    var shipcountry = addressRecord.getValue('country');

                    if (shipaddr1) {
                       // SR-18931  modify the condition of shippaddr1.length
                        if ((shipaddr1.length < '4' && shipcountry == 'DE') || (shipaddr1.length < '5' && shipcountry != 'DE')) {
                            if (shipcountry == 'DE') {
                                alert(' For Germany country , there should be minimum 4 characters in Address1 field. Please enter a proper Address1')

                            } else {
                                alert(' For UK/Ireland/Jersey/Guernsey country , there should be minimum 5 characters in Address1 field. Please enter a proper Address1')

                            }
                          // SR-18931  end
                            addressRecord.setValue({
                                fieldId: 'addr1',
                                value: '',
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            });
                            return false;
                        } else {
                            var isCompleteNumber = completeNumber(shipaddr1)
                            if (isCompleteNumber == true) {
                                //SR-16746 change the alert message of below 1 line.
                                alert(' For UK/Ireland/Germany/Jersey/Guernsey country , you have entered all numbers in address 1 field ,  Please enter a proper Address1')
                                addressRecord.setValue({
                                    fieldId: 'addr1',
                                    value: '',
                                    ignoreFieldChange: true,
                                    forceSyncSourcing: true
                                });
                                return false;
                            }
                        }
                    }

                }
                if (fieldId == 'addr2') {
                    var shipaddr2 = addressRecord.getValue('addr2')
                    shipaddr2 = shipaddr2.replace(/\s/g, "")
                    var shipcountry = addressRecord.getValue('country') //SR-16746 add this line

                    if (shipaddr2.length == '1' && shipcountry != 'DE') { //SR-16746  modify the if conditon (add the && shipcountry != 'DE' condition)


                        alert(' For UK/Ireland/Jersey/Guernsey country , there should be more than 1 character in Address2 field. Please enter a proper Address2')
                        addressRecord.setValue({
                            fieldId: 'addr2',
                            value: '',
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                        return false;
                    }

                }
                if (fieldId == 'city') {
                    var city = addressRecord.getValue('city')
                    if (city) {
                        city = city.replace(/\s/g, "")

                        if (city.length < '3') {
                            //SR-16746 change the alert message of below 1 line.

                            alert(' For UK/Ireland/Germany/Jersey/Guernsey country , there should be minimum 3 characters in City field. Please enter a proper City')
                            addressRecord.setValue({
                                fieldId: 'city',
                                value: '',
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            });
                            return false;
                        } else {
                            var isCompleteNumber = completeNumber(city)
                            if (isCompleteNumber == true) {
                                //SR-16746 change the alert message of below 1 line.
                                alert(' For UK/Ireland/Germany/Jersey/Guernsey country , you have entered all numbers in City field ,  Please enter a proper City')
                                addressRecord.setValue({
                                    fieldId: 'city',
                                    value: '',
                                    ignoreFieldChange: true,
                                    forceSyncSourcing: true
                                });
                                return false;
                            }
                        }
                    }
                }


                return true;
            } catch (error) {
                log.debug('Error in validateField ' + error.message, error)
                alert('Error in validateField ' + error.message)
            }
        }

        function checkSpacePresent(str) {
            var result = str.substring(1, str.length - 1);
            var isSpacePresent = containsWhitespace(result)
            log.debug('isSpacePresent', isSpacePresent)
            return isSpacePresent

        }

        function containsWhitespace(str) {
            return str.match(/\s/) !== null;
        }

        function saveRecord(context) {
            try {
                var addressRecord = currentRecord.get();
                var shipcountry = addressRecord.getValue('country') //SR-16746 Add this line.
                var shipaddr1 = addressRecord.getValue('addr1')
              // SR-18931  modify the condition of shippaddr1.length
                shipaddr1 = shipaddr1.trim()
                if (shipaddr1.length < '4' && shipcountry == 'DE') {
                    //SR-16746 change the alert message of below 1 line.
                    alert(' For Germany country , there should be minimum 4 characters in Address1 field. Please enter a proper Address1')
                    return false;
                }
                if (shipaddr1.length < '5' && shipcountry != 'DE') {
                    //SR-16746 change the alert message of below 1 line.
                    alert(' For UK/Ireland country , there should be minimum 5 characters in Address1 field. Please enter a proper Address1')
                    return false;
                } // SR-18931  end 


                var shipaddr2 = addressRecord.getValue('addr2')
                shipaddr2 = shipaddr2.replace(/\s/g, "")
                if (shipaddr2.length == '1' && shipcountry != 'DE') { //SR-16746  modify the if conditon (add the && shipcountry != 'DE' condition) 
                    alert(' For UK/Ireland/Jersey/Guernsey country , there should be more than 1 character in Address2 field. Please enter a proper Address2') //SR-16746 change the alert message of below 1 line.
                    return false;
                }

                var isCompleteNumber = completeNumber(shipaddr1)
                if (isCompleteNumber == true) {
                    //SR-16746 change the alert message of below 1 line.
                    alert(' For UK/Ireland/Germany/Jersey/Guernsey country , you have entered numbers in address 1 field , there should be more than 1 character in Address1 field. Please enter a proper Address1')
                    return false;
                }

                var city = addressRecord.getValue('city')
                city = city.replace(/\s/g, "")
                if (city.length < '3') {
                    //SR-16746 change the alert message of below 1 line.
                    alert(' For UK/Ireland/Germany/Jersey/Guernsey country , there should be minimum 3 characters in City field. Please enter a proper City')
                    return false;
                }

                var isCompleteNumber = completeNumber(city)
                if (isCompleteNumber == true) {
                    //SR-16746 change the alert message of below 1 line.
                    alert(' For UK/Ireland/Germany/Jersey/Guernsey country , you have entered numbers in city field , there should be more than 1 character in city field. Please enter a proper City')
                    return false;
                }

                var result = throwAlert(addressRecord)
                console.log('result in saverecord' + result)
                return result;
            } catch (error) {
                alert('error in save Record' + error.message)
            }


        }

        function throwAlert(addressRecord) {
            var shipcountry = addressRecord.getValue({
                fieldId: "country"
            });
            console.log('shipcountry', shipcountry)
            var shipzip = addressRecord.getValue({
                fieldId: "zip"
            });
            if (shipcountry!='DE') { //SR-18931
                if (shipzip) {
                    var blankPresentInZip = checkSpacePresent(shipzip)
                    if (!blankPresentInZip) {
                        alert(' For UK/Ireland/Jersey/Guernsey country , there should be a space in between for the Zip code. Please enter a proper Zip and save the record')
                        addressRecord.setValue({
                            fieldId: 'zip',
                            value: '',
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                        return false;
                    }
                }
                return true;
            }
            //SR-16746 Start add this below if block
            if (shipcountry == 'DE') { 
                if (shipzip) {
                    shipzip = shipzip.replace(/\s/g, "")

                    var isZipNumber = completeNumber(shipzip)
                    if (shipzip.length != 5 || isZipNumber == false) {
                        alert('For Germany country , there should be 5 digits in the Zip and no spaces in between the digits.')
                        addressRecord.setValue({
                            fieldId: 'zip',
                            value: '',
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                        return false;
                    }
                }
            }
            //SR-16746 End
            return true;
        }

        function completeNumber(val) {
            return /^\d+$/.test(val);
        }

        return {
            validateField: validateField,
            saveRecord: saveRecord
        };
    });