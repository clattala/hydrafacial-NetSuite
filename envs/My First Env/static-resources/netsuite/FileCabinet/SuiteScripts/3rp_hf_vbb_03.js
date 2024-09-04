/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/record', 'N/render','N/redirect'],
 /**
* @param{record} record
* @param{render} render
*/
 (record, render, redirect) => {
     /**
      * Defines the Suitelet script trigger point.
      * @param {Object} scriptContext
      * @param {ServerRequest} scriptContext.request - Incoming request
      * @param {ServerResponse} scriptContext.response - Suitelet response
      * @since 2015.2
      */
     const onRequest = (context) => {
       
             var serverResponse = context.request.parameters;
             var recId          = serverResponse.recId;
             var recType        = serverResponse.recType;
             var recButton      = serverResponse.recButton;
            
             if (recButton == 1)
             
             {
                //var rec = record.load({type: recType, id: recId , isDynamic : true});
                //rec.setValue({fieldId: 'paymenthold', value:  true});
                //rec.save()

                var id = record.submitFields({
                  type: recType,
                  id: recId,
                  values: {paymenthold: true}
               });

             }
             
             if (recButton == 2)
             
             {
                //var rec = record.load({type: recType, id: recId , isDynamic : true});
                //rec.setValue({fieldId: 'paymenthold', value:  false});
                //rec.save()

                var id = record.submitFields({
                  type: recType,
                  id: recId,
                  values: {paymenthold: false}
               });

             }
              
             redirect.toRecord({type: recType, id: recId });
             

     }

     return {onRequest}

 });
