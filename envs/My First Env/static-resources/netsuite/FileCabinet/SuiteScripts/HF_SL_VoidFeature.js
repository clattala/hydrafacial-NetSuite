/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 
 /*********************************************************************************
 * JIRA# 		: NGO-4749
 * Description	: To check the Standard Accounting preference "Void Transactions Using Reversing Journals Preference" using Suitelet.
 * Script Type  : Suitelet
 * Created On   : 11/24/2022
 * Script Owner : Kaleru Pavan
 
*********************************************************************************/
define(['N/ui/serverWidget', 'N/config', 'N/record'],

    function(ui, config, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */

        function onRequest(context) {
            var request = context.request;
            var response = context.response;
            log.debug({
                title: 'onRequest',
                details: 'request method = ' + request.method
            });
          try{
            if (request.method === 'GET') {
                var displayForm = ui.createForm({
                    title: 'Void Transactions Using Reversing Journals Preference'
                });

                var voidFeature = displayForm.addField({
                    id: 'custpage_voidfeature',
                    type: 'checkbox',
                    label: 'Void Transactions Using Reversing Journals Preference'
                });
                var configRecObj = config.load({
                    type: config.Type.ACCOUNTING_PREFERENCES
                });
                log.debug('configRecObj', configRecObj)
                var reversalVoiding = configRecObj.getValue({
                    fieldId: 'REVERSALVOIDING',
                });
                log.debug('reversalVoiding', reversalVoiding);
              	var feature = reversalVoiding == true ? 'on':'off'
                var buttonValue = reversalVoiding == true ? 'uncheck':'check'
                log.debug('feature' , feature)
              
              var message = 'Void Transactions Using Reversing Journals Preference has been currently turned ' + feature + ' Please ' + buttonValue + ' the below checkbox if you want to change the preference'
             // createHtmlField(displayForm , message)
				reversalVoiding = reversalVoiding == true ? 'T' : 'F'
              	log.debug('reversalVoiding' , reversalVoiding)
                voidFeature.defaultValue = reversalVoiding
              message = '<h4>' + message + '</h4>'
              createHtmlField('displayhtml',displayForm , message ,true)
              	displayForm.addSubmitButton('Update the Feature')
                response.writePage(displayForm);

                //var cf = configRecObj.save();
            } else {
              
              	log.debug('post method')
              	var reversalVoidingValue = request.parameters.custpage_voidfeature;
              	log.debug('reveraslVoidingValue in post', reversalVoiding)
              	if(!reversalVoidingValue || reversalVoidingValue == 'F'){
                  reversalVoidingValue= false;
                }else{
                  reversalVoidingValue= true;
                }
                var configRecObj = config.load({
                    type: config.Type.ACCOUNTING_PREFERENCES
                });
                log.debug('configRecObj', configRecObj)
                var reversalVoiding = configRecObj.setValue({
                    fieldId: 'REVERSALVOIDING',
                  	value : reversalVoidingValue
                });
              var reversalVoiding = configRecObj.setValue({
                    fieldId: 'SETREVERSINGVARIANCEDATETOREVJES',
                  	value : reversalVoidingValue
                });
              configRecObj.save();
              createForm('Success', '<h2>' + 'The Feature has been updated ' + '</h2' , context, 'success')
              return;
            }
          }catch(error){
            
           
            createForm("Error",  '<h2> ' +  "Error is " + error.message + 'Full description : ' + error + '</h2>' , context , 'error')
          }
        }
		
  		function createForm(title, message , context , fieldId){
           var infoForm = ui.createForm({
                title: title
            });
           /* var info = infoForm.addField({
                    id: 'custpage_info',
                    type: 'inlinehtml',
                    label: 'Info'
                })
            info.defaultValue = htmlLine;
            var htmlLine = message*/
			createHtmlField(fieldId , infoForm , message)
            
            context.response.writePage(infoForm)
          	return;
        }
  
  		function createHtmlField(fieldid , infoForm , message, UpdatelayOut){
          var info = infoForm.addField({
                    id: 'custpage_'+fieldid,
                    type: 'inlinehtml',
                    label: 'Info'
                })
           
            if(UpdatelayOut){
			info.updateLayoutType({
            layoutType : ui.FieldLayoutType.OUTSIDEABOVE
        });
        info.updateBreakType({
            breakType : ui.FieldBreakType.STARTROW
        })
            }
            info.defaultValue = message;
            
        }
	
        return {
            onRequest: onRequest
        };

    });