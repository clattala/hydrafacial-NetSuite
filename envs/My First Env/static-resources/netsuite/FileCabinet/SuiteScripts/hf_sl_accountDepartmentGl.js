/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @NAuthor Pavan Kalerud
 */
define(['N/format', 'N/ui/serverWidget', 'N/search', 'N/record', 'N/redirect', 'N/runtime', 'N/url'],

    (format, ui, search, record, redirect, runtime, url) => {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        const onRequest = context => {

            log.debug('Starting script')
            
            if (context.request.method == 'GET')
                getRequest(context);
            else
                postRequest(context);
        }

        const getRequest = context => {
            const {
                request,
                response
            } = context;
            const params = request.parameters;
            log.debug('params', params)
            const recId = params.recId;
            const lineNumber = params.lineNumber;
            log.debug('lineNumnber', lineNumber)

            if (lineNumber > 0) {
                // Add custom fields
                const form = buildForm(params);
                context.response.writePage(form);
            } else {
                const selectLinesForm = buildLinesForm(params)
                context.response.writePage(selectLinesForm);

            }

        }

        const buildLinesForm = params => {
            const form = ui.createForm({
                title: 'Select the line to allocate Accounts'
            });
            const vendorBill = record.load({
                type: 'vendorbill',
                id: params.recId
            })
            var lineCount = vendorBill.getLineCount('item');
            log.debug('lineCount', lineCount)
            var selectLine = form.addField({
                id: 'custpage_selectline',
                type: 'select',
                label: 'Line Number'
            })

          var lineAmountJson = form.addField({
                id: 'custpage_lineamount',
                type: 'text',
                label: 'Line Amount'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            })
          selectLine.defaultValue = params.lineNumber
            var vendorBillId = form.addField({
                id: 'custpage_vendorbillid',
                type: 'text',
                label: 'vendorBillId'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            })
            vendorBillId.defaultValue = params.recId;
			var allAmounts =''
            for (var i = 0; i < lineCount; i++) {
				
                var itemText = vendorBill.getSublistText({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
				var amount = vendorBill.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount',
                    line: i
                });
              if(allAmounts!=''){
              allAmounts = allAmounts + ',' + amount
              }else{
                allAmounts = amount;
              }
                selectLine.addSelectOption({
                    value: i + 1,
                    text: itemText
                });
            }
			lineAmountJson.defaultValue = allAmounts;
          log.debug('amountJson in 104' , allAmounts)
            var button = form.addSubmitButton({
                id: 'searchbutton',
                label: 'Submit',
            });
            return form
        }
        const buildForm = params => {
            const script = runtime.getCurrentScript();
            const form = ui.createForm({
                title: 'Select Accounts , Departments for Purchase Order'
            });

          form.clientScriptFileId = 6651151;
          var selectLine = form.addField({
                id: 'custpage_selectline',
                type: 'select',
                label: 'Select the Line Number'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

          var lineAmount = form.addField({
                id: 'custpage_amount',
                type: 'text',
                label: 'Amountr'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });


          selectLine.defaultValue = params.lineNumber;
            lineAmount.defaultValue = params.amount
            const firstDepartment = form.addField({
                id: 'custpage_first_department',
                type: 'select',
                source: 'department',
                label: 'First department'
            });
            const secondDepartment = form.addField({
                id: 'custpage_second_department',
                type: 'select',
                source: 'department',
                label: 'Second department'
            });
            const thirdDepartment = form.addField({
                id: 'custpage_third_department',
                type: 'select',
                source: 'department',
                label: 'Third department'
            });
            const fourthDepartment = form.addField({
                id: 'custpage_fourth_department',
                type: 'select',
                source: 'department',
                label: 'Fourth department'
            });

            const firstAmount = form.addField({
                id: 'custpage_first_amount',
                type: 'float',
                label: 'First amount'
            });
            const secondAmount = form.addField({
                id: 'custpage_second_amount',
                type: 'float',
                label: 'Second amount'
            });
            const thirdAmount = form.addField({
                id: 'custpage_third_amount',
                type: 'float',
                label: 'Third amount'
            });
            const fourthAmount = form.addField({
                id: 'custpage_fourth_amount',
                type: 'float',
                label: 'Fourth amount'
            });
            var vendorBillId = form.addField({
                id: 'custpage_vendorbillid',
                type: 'text',
                label: 'vendorBillId'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            vendorBillId.defaultValue = params.recId
            var shouldRedirect = form.addField({
                id: 'custpage_redirect',
                type: 'text',
                label: 'vendorBillId'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            shouldRedirect.defaultValue = 'T';

            var button = form.addSubmitButton({
                id: 'searchbutton',
                label: 'Submit',
            });

            return form
        }


        const postRequest = context => {
            const {
                request,
                response
            } = context;
            const params = request.parameters;
            log.debug(' post params', params)
            var lineNumber = params.custpage_selectline;

            log.debug(' post lineNumber', lineNumber)
            var vendorBillId = params.custpage_vendorbillid
            log.debug('vendorBillId', vendorBillId)
            var shouldRedirect = params.custpage_redirect
            log.debug('shouldRedirect', shouldRedirect)
			var lineAmountJson = params.custpage_lineamount
			log.debug('lineAmountJson' , lineAmountJson);
            var index = lineAmountJson.indexOf(',')
           log.debug('index' , index)
           if(index!=-1){
             var amount = lineAmountJson.split(',')[lineNumber-1]
             log.debug('amount ' , amount)
           }else{
             var amount = lineAmountJson
           }
			log.debug('amount' , amount);
            if (!shouldRedirect) {
                if (lineNumber > 0) {
                    redirect.toSuitelet({
                        scriptId: 'customscript_hf_sl_select_account_po_gl',
                        deploymentId: 'customdeploy_hf_sl_select_account_po_gl',
                        parameters: {
                            'lineNumber': lineNumber,
                            'recId': vendorBillId,
                            'lineExist': true,
                            'amount' : amount
                        }
                    });
                }
            } else {        
            
              var firstDepartment = params.custpage_first_department
              var firstAmount = params.custpage_first_amount
              var secondDepartment = params.custpage_second_department
              var secondAmount = params.custpage_second_amount
              var thirdDepartment = params.custpage_third_department
              var thirdAmount = params.custpage_third_amount
              var fourthDepartment = params.custpage_fourth_department
              var fourthAmount = params.custpage_fourth_amount
              log.debug('firstDepartment' + firstDepartment , 'firstAmount ' + firstAmount)
                            log.debug('secondDepartment' + secondDepartment , 'secondA ' + secondAmount)

                            log.debug('thirdDe' + thirdDepartment , 'thirdA ' + thirdAmount)

                            log.debug('fourth' + fourthDepartment , 'fourtstAmount ' + fourthAmount)
               var lineComments = firstDepartment + ',' + secondDepartment + ',' + thirdDepartment + ',' + fourthDepartment + '/' + firstAmount + ',' + secondAmount + ',' + thirdAmount + ',' + fourthAmount
 
              		var vendorBillRecord = record.load({
					type:'vendorbill',
					id: vendorBillId
				});
              /*var lineComments = 'firstAccount:'+firstAccount + ',' + 'firstDepartment:'+firstDepartment+ ',' +'firstAmount:'+firstAmount
               var lineJson = {
                 'firstAccount' : firstAccount,
                 'firstDepartment' : firstDepartment,
                 'firstAmount' : firstAmount
               }*/
				log.debug('vendorBillRecord' , vendorBillRecord);
              log.debug('247 lineNumber' , lineNumber)
                                       vendorBillRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_hf_comment',
                            value: lineComments,
                            line: lineNumber-1
                        });
              vendorBillRecord.save();
                redirect.toRecord({
                    type: 'vendorbill',
                    id: vendorBillId,
                    isEditMode: false,
                    parameters: {
                        'custparam_test': 'helloWorld'
                    }
                });
            }

        }

        // Get all saved search results.
        const getAllSSResult = searchResultSet => {
            const result = [];
            for (const x = 0; x <= result.length; x += 1000)
                result = result.concat(searchResultSet.getRange(x, x + 1000) || []);
            return result;
        }

        return {
            onRequest
        };

    }
);