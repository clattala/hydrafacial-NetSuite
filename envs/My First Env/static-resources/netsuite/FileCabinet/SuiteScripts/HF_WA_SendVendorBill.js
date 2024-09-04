/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
 define(['N/search', 'N/email','N/url','N/record', 'N/file','N/format', 'N/runtime'], function (search, email, url, record, file,format, runtime) {
    function onAction(scriptContext) {
        log.debug({
            title: 'Start Script'
        });
        var newRecord = scriptContext.newRecord;
		var tranId = newRecord.getValue('tranid')
		var onBehalfOf = newRecord.getValue('custbody_hf_on_behalf_of');
		var urlObj = getUrl(newRecord.id);
     
		var arr_fileId = getAttachments(newRecord.id)
        log.debug('arr_fileId',arr_fileId)
		var arr_attachments = [];
      	log.debug('arr_fileId.length',arr_fileId.length)
		if(arr_fileId.length>0){
          log.debug('lenght greather than 0')
			for(var i=0;i<arr_fileId.length;i++){
				var fileObj = file.load({
					id : arr_fileId[i]
				})
				arr_attachments.push(fileObj)
			}
		}
      var tableData = getTableCode(newRecord)
      log.debug('tableData', tableData)
      var scriptObj = runtime.getCurrentScript()
            var billSender = scriptObj.getParameter({
                name: 'custscript_hf_po_bill_sender'
            })
        try {
            email.send({
                author: billSender,
                recipients: onBehalfOf,
                subject: 'Vendor Bill ' + tranId + ' has been submitted for approval',
                body: 'Hello,</br></br>The Vendor bill ' + tranId + ' has been submitted for approval </br></br> ' + tableData + '</br></br> <a href="'+ urlObj.recordUrl +'">View Vendor bill</a> </br></br> <a href="'+ urlObj.approveUrl +'">Approve Bill </a></br></br>  <a href="'+ urlObj.rejectUrl +'">Reject Bill </a></br></br> ' ,
				attachments : arr_attachments,
                relatedRecords: {
                    transactionId: newRecord.id
                }
            });
        } catch (e) {
            log.debug('error', e);
        }
		
    }
    function getUrl(recId){
        var scheme = 'https://';
        var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });
        var relativePath = url.resolveRecord({
            recordType: 'vendorbill',
            recordId: recId,
            isEditMode: false
        });
        var recordUrl = scheme + host + relativePath;
		var suiteletUrl = url.resolveScript({
    scriptId: 'customscript_hf_sl_appr_reject_online',
    deploymentId: 'customdeploy_hf_sl_appr_reject_online',
    returnExternalUrl: true
});
      var approveUrl = suiteletUrl+ '&recId='+ recId +'&buttonClicked=' +'approve'
      var rejectUrl = suiteletUrl+ '&recId='+ recId +'&buttonClicked=' +'reject'
        return {
          'recordUrl' : recordUrl,
          'approveUrl' : approveUrl,
          'rejectUrl' : rejectUrl
        }
    }
	
	function getAttachments(vendorBillId){
		var vendorbillSearchObj = search.create({
   type: "vendorbill",
   filters:
   [
      ["type","anyof","VendBill"], 
      "AND", 
      ["internalidnumber","equalto",vendorBillId], 
      "AND", 
      ["mainline","is","T"]
   ],
   columns:
   [
      search.createColumn({
         name: "name",
         join: "file",
         label: "Name"
      }),
      search.createColumn({
         name: "internalid",
         join: "file",
         label: "Internal ID"
      })
   ]
});
var searchResultCount = vendorbillSearchObj.runPaged().count;
log.debug("vendorbillSearchObj result count",searchResultCount);
var arr_fileId = [];
 log.debug('arr_fileId search ',arr_fileId)
vendorbillSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
  var fileId = result.getValue({
         name: "internalid",
         join: "file"
      })
  log.debug('fileId', fileId)
  if(fileId){
   arr_fileId.push(fileId);
  }
   return true;
});
return arr_fileId;
	}
   
  function getTableCode(vendorBill)
	{
		try{
          	var lineCount = vendorBill.getLineCount({
                            sublistId: 'item'
                        });
          var vendor = vendorBill.getText('entity')
          var terms = vendorBill.getText('terms')
          var dueDate = vendorBill.getValue('duedate')
          log.debug('dueDate', dueDate)
          dueDate = format.format({
                type: format.Type.DATE,
                value: dueDate
            });
          log.debug('dueDate after', dueDate)
          log.debug('lineCount', lineCount)
			var tableColumn;
			var htmlVariable = '<html>';
			htmlVariable += '<head>';
			htmlVariable +='</head>';
			htmlVariable +='<body>';
//			htmlVariable += '<script language="JavaScript">';
			htmlVariable +='<table style="border: 1px solid black">';
			htmlVariable +='<tr>';
          htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Vendor</th>';
			htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Due Date</th>';
			htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Terms</th>';
			htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Item</th>';
			htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Quantity</th>';
			htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Rate</th>';
          	htmlVariable +='<th style="color:grey; font-size: 15px;border: 1px solid black">Amount</th>';

			htmlVariable +='</tr>';               

			for(var i=0; i<lineCount;i++)
			{
				var item = vendorBill.getSublistText({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                            var quantity = vendorBill.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });
              var rate = vendorBill.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: i
                            });
                            var amount = vendorBill.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i
                            });
				htmlVariable += '<tr>';
              
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +vendor +'</td>';
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +dueDate +'</td>';
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +terms +'</td>';
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +item +'</td>';
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +quantity +'</td>';
				htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +rate +'</td>';
              htmlVariable +='<td style="color:black; font-size: 15px;border: 1px solid black">' +amount +'</td>';
				htmlVariable += '</tr>';
			}

			htmlVariable += '</table>';
			htmlVariable += '</body>';
			htmlVariable += '</html>';
			return htmlVariable;
		}catch(e)
		{
			log.debug({
				title : 'ERROR In gettableCode function: ',
				details : e.toString()
			});
		}
	}
   	
    return {
        onAction: onAction
    }
});