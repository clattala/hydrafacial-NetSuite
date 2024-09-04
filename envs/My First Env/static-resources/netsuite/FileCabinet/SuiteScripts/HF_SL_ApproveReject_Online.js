/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/*********************************************************************************
 * JIRA# 		: 
 * Description	: To give approval rejection from the mail
 * Date   : 21/12/2022 
 * Author : Kaleru Pavan
 
*********************************************************************************/ 



define(["N/ui/serverWidget","N/record"],

  function(ui,record) {


    function onRequest(context) {
      try{

        
        if(context.request.method =='GET'){

          var recordId = context.request.parameters.recId;
          log.debug('recordId' , recordId)
          var buttonExecution = context.request.parameters.buttonClicked;
          
          log.debug('parameters rejectionReason', buttonExecution);

          var approve  = 'approve';
          var reject 	 = 'reject';
		  if(buttonExecution==approve){
            	var vendorBill = record.load({
                  type : 'vendorbill',
                  id : recordId
                })
                var tranId = vendorBill.getValue('tranid')
                vendorBill.setValue('approvalstatus', 2)
            	var id = vendorBill.save();
			  	log.debug('id' , id)
            	if(id){
                  createForm('APPROVED', '<h2> ' + 'Vendor Bill ' + tranId + ' has been approved ' + '</h2>' , context , '_approved')
                }
		  }else{
			  if(buttonExecution==reject){
                var form = ui.createForm({
        			title: 'Enter Rejection Reason'
        		});
				var rejectionReason = form.addField({
        			id: 'custpage_reject_reason',
        			type: ui.FieldType.TEXT,
        			label: 'Rejection Reason'
            	});
                var recordIdfield = form.addField({
        			id: 'custpage_rec_id',
        			type: ui.FieldType.TEXT,
        			label: 'RecId',
            	}); 
				
				recordIdfield.defaultValue = recordId;
                				recordIdfield.updateDisplayType({displayType: 'HIDDEN'});

                
                form.addSubmitButton({
        			label: 'Save'
        		});
        			
        		context.response.writePage(form);
				 
			  }
		  }
         
        
        }else{
          var rejectionReason = context.request.parameters.custpage_reject_reason;
          var recordId = context.request.parameters.custpage_rec_id; 
           var vendorBill = record.load({
                  type : 'vendorbill',
                  id : recordId
                })
                var tranId = vendorBill.getValue('tranid')
                vendorBill.setValue('approvalstatus', 3)
                                    
          		vendorBill.setValue('custbody_hf_rejection_reason', rejectionReason)
            	var id = vendorBill.save();
			  	log.debug('id' , id)
            	if(id){
                  createForm('REJECTED', '<h2> ' + 'Vendor Bill ' + tranId + ' has been rejected ' + '</h2>' , context , '_rejected')
                }
        }

      }catch(error){
        log.debug('error in onRequest() function',error);
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