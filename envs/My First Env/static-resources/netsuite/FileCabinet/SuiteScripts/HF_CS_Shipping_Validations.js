/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * /*************************************************************
JIRA  ID      : https://helpdesk.beautyhealth.com/a/tickets/4670
Author        : Hemang Dave
Description   : Shipping validation based on UPS/FEDEX method
*************************************************************
 */
define(['N/runtime'],
    function(runtime) {

        function saveRecord(context) {
            var currentRecord = context.currentRecord;
            var shipPaymentType = currentRecord.getText('custbody_hf_ship_pymt_type');
            var shipPaymentAccount = currentRecord.getText('custbody_hf_shippayacct');
			var account = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_cfr_account' });
			var country_code = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_ship_country_code' });
			
			var pt_1 = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_pt_prepaid' });	//Prepaid
			var pt_2 = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_pt_ddp' });	//'Delivered Duty Paid'
			var pt_3 = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_pt_third_party' });	//'Third Party'
			
			
            log.debug('shipPaymentAccount', shipPaymentAccount);
            var shipCountry = currentRecord.getValue('shipcountry');
            var shippingMethod = currentRecord.getValue('shipmethod'); // Get the internal ID of the shipping method
            var subsidiary = currentRecord.getValue('subsidiary');

            // Retrieve the complete shipping method name
            var shippingMethodName = currentRecord.getText('shipmethod');

            // Check if the shipping method contains 'UPS' or 'FEDEX' as part of its name
            if (shippingMethodName.includes('UPS') || shippingMethodName.includes('FEDEX')) {
                log.debug('Entered', ' Shipping Method is UPS/FEDEX');
                
                // Validation for empty payment account
                if (!shipPaymentAccount) {
                    log.debug('Entered', ' Inside Ship payment Account');

                    // Validation based on shipment location
                    if (shipCountry == country_code) {
                        // For domestic (United States), payment type should be PREPAID
                        log.debug('shipPaymentType', shipPaymentType);
                        if (shipPaymentType != pt_1) {
                            alert('For domestic shipments, Payment Type must be PREPAID. Please update the Payment Type.');
                            return false;
                        }
                    } else {
                        // For international shipments, payment type should be DDP
                        if (shipPaymentType != pt_2) {
                            alert('For international shipments, Payment Type must be DDP (Delivered Duty Paid) or Third Party. If Third Party  ship payment account is required');
                            return false;
                        }
                    }
                } else {
                    log.debug('Entered', ' Inside Else');

                    // Validation for non-empty payment account
                    if (shipPaymentAccount == account) {
                        // If payment account is C058Y9, make payment account blank and set payment type as DDP
                        currentRecord.setValue('custbody_hf_shippayacct', '');
                        currentRecord.setText('custbody_hf_ship_pymt_type', 'Delivered Duty Paid');
                    } else {
                        // If payment account is not C058Y9, payment type should be THIRD PARTY
                        if (shipPaymentType != pt_3) {
                            alert('For payment accounts other than C058Y9, Payment Type must be THIRD PARTY. Please update the Payment Type.');
                            return false;
                        }
                    }
                }
            }

            // Return true to allow the record to be saved after passing all validations
            return true;
        }

        return {
            saveRecord: saveRecord
        };
    })