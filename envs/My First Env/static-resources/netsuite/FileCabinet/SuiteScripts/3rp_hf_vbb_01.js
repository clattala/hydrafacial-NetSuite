/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/record'],
 /**
* @param{record} record
*/
 (record) => {
     /**
      * Defines the function definition that is executed before record is loaded.
      * @param {Object} scriptContext
      * @param {Record} scriptContext.newRecord - New record
      * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
      * @param {Form} scriptContext.form - Current form
      * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
      * @since 2015.2
      */
     const beforeLoad = (context) => {

     
             if(context.type == 'view')
             
            {
             
                 var currentForm = context.form;

                 var bill = context.newRecord;

                 currentForm.clientScriptModulePath = './3rp_hf_vbb_02.js';   // ****** Reconnecting to ClientScript 

                var payment_hold    = bill.getValue({fieldId:'paymenthold'});  
                var subsidiary      = bill.getText({fieldId:'subsidiary'});  

                log.debug(subsidiary);   // 	HF-United Kingdom 

                if ((payment_hold == false) && (subsidiary == "HF-United Kingdom"))
                {
                    currentForm.addButton({
                                         id:             'custpage_3rp_hf_vbb_button_1',
                                         label:          'Payment Hold',
                                         functionName:   'CallforSuiteletOne()'
                                        });
                }

                if((payment_hold == true) && (subsidiary == "HF-United Kingdom"))
                {
                    currentForm.addButton({
                                        id:             'custpage_3rp_hf_vbb_button_2',
                                        label:          'Remove Payment Hold',
                                        functionName:   'CallforSuiteletTwo()'
                                      });
                }

            }

     }

     return {beforeLoad}

 });
