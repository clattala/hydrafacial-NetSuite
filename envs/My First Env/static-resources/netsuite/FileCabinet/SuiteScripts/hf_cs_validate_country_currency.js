/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
 define(['N/ui/message', 'N/runtime'],
 function (msg, runtime) {
     function showErrorMessage(msgText) {
         var myMsg = msg.create({
             title: "Cannot Save Record",
             message: msgText,
             type: msg.Type.ERROR
         });

         myMsg.show({
             duration: 10000
         });
     }

     function saveRec(context) {
         console.log(context.currentRecord.getValue({
             fieldId: 'id'
         }));
         console.log('text');
         var rec = context.currentRecord;
       	 var myScript = runtime.getCurrentScript();
         var validation = myScript.getParameter({
            name: 'custscript_validation'
         });
         validation = JSON.parse(validation);
         var country = rec.getText({
             fieldId: 'custrecord_2663_entity_country'
         });
         var currency = rec.getText({
            fieldId: 'custrecord_hf_currency_code'
        });
        var method = rec.getText({
            fieldId: 'custrecord_hf_method'
        });
       	console.log(validation.hasOwnProperty(country.toLowerCase()));
       if(validation.hasOwnProperty(country.toLowerCase())){
                if (
                        validation[country.toLowerCase()].currency.indexOf(currency.toLowerCase()) == -1 || 
                        validation[country.toLowerCase()].method.indexOf(method) == -1
                ) 
                {
                    showErrorMessage("For "+country+" country Currency Code should be '"+validation[country.toLowerCase()].currency+"' & Method should be '"+validation[country.toLowerCase()].method+"'");
                    return false;
                }
       }
       return true;
     }

     return {
         saveRecord: saveRec
     }
 });