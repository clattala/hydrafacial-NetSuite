/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * /*************************************************************
JIRA  ID      : #CHN-553 Standardization of payment terms for UK capital sales orders
Author        : Pavan Kaleru
Description   : throw an alert if either Total no of payments or DownPayment is empty 
*************************************************************
 */
define([],
    function() {

        function saveRecord(context) {
			try{
				let currentRecord = context.currentRecord;
				let i_subsidiary = currentRecord.getValue('subsidiary')
				if(i_subsidiary=='11'){ //UK subsidiary
					let i_noOfPayments = currentRecord.getValue('custbody_hf_number_of_payments')
					let i_downPayment = currentRecord.getValue('custbody_hf_term_first_amt')
					if(!i_noOfPayments || !i_downPayment){
						alert('Please ensure INSTALLMENT orders have the details for the number of payments and the down payment amount entered correctly under the "Billing" subtab.' )
					}
				   
				}
				return true;
                
            }
			catch(error){
				alert('Error in save Record ' + error.message );
			}
            
        }

        return {
            saveRecord: saveRecord
        };
    })