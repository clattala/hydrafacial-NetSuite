/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/search','N/record','N/ui/message'],
 /**
* @param{record} record
*/
 (search,record,message) => {
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

             if((context.type == 'view') || (context.type == 'edit'))

             {

                 var order    = context.newRecord;
                 var sub_id   = order.getValue({fieldId:'subsidiary'});

                 if(sub_id == 11)   // 11 is UK Subsiderary

                  {
                    var currentForm = context.form;

                    //currentForm.clientScriptFileId = 317292;   //Internal ID of the Client script file in the File cabinet 

                    currentForm.clientScriptModulePath = 'SuiteScripts/3rp_hf_epi_02.js';   // ****** Reconnecting to ClientScript

                    currentForm.addButton({
                                         id:             'custpage_3rp_hf_epi_print_button',
                                         label:          'Email Proforma',
                                         functionName:   'CallforSuitelet()'
                                       });
                  }

              }

     }

     return {beforeLoad}

 });
