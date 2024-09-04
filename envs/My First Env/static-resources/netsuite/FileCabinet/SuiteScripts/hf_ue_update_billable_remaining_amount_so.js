/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/record', 'N/search'],
    function (record, search) {
        function afterSubmit(context) {
          	log.debug('trigger',context.newRecord);
            var recObj = context.newRecord;
          	var transactionSearchObj = search.create({
               type: "itemfulfillment",
               filters:
               [
                  ["internalid","anyof", recObj.id], 
                  "AND", 
                  ["mainline","is","T"], 
                  "AND", 
                  ["createdfrom.type","anyof","SalesOrd"],
                  "AND", 
                  ["type","anyof","ItemShip"]
               ],
               columns:
               [
                  search.createColumn({name: "createdfrom", label: "Created From"}),
                  search.createColumn({
                     name: "type",
                     join: "createdFrom",
                     label: "Type"
                  })
               ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
          	if(searchResultCount == 0){
              return;
            }
          	log.debug('trigger1','true');
            var status = recObj.getValue('shipstatus');


            // : record.Type.INVOICE
            var salesOrderId = recObj.getValue('createdfrom');
			try{
              var soData = record.load({ type: record.Type.SALES_ORDER, id: salesOrderId });
            }catch(e){
              log.error('error', e.message);
            }
          	if(!soData){return;}
          	log.debug('trigger2','true');
            var soLines = getLines(soData, 'item');
            var soTotal = soData.getValue('total');
            var PaymentTerm = (soData.getValue('terms') == '' ? record.Type.CASH_SALE : record.Type.INVOICE);

            var sublistId1 = 'links';
            var relreccount = soData.getLineCount({ sublistId: sublistId1 });
            var relrec = {};
            var billedAmount = 0.00;
            for (var i = 0; i < relreccount; i++) {
                var lineData = {
                    linkType: soData.getSublistValue({ sublistId:sublistId1, fieldId: 'linktype', line:i })
                    , id: soData.getSublistValue({ sublistId:sublistId1, fieldId: 'id', line:i })
                    , tranId: soData.getSublistValue({ sublistId:sublistId1, fieldId: 'tranid', line:i })
                    , total: soData.getSublistValue({ sublistId:sublistId1, fieldId: 'total',line:i })
                    , status: soData.getSublistValue({ sublistId:sublistId1, fieldId: 'status',line:i })
                }
        
                if (!relrec.hasOwnProperty(lineData.id) && lineData.linkType === "Order Bill/Invoice") {
                    relrec[lineData.id] = lineData;
                    billedAmount += Number(lineData.total);
                }
            }
            var soTotal = soTotal - billedAmount;
          	var errorTransform = false;
			log.debug('soTotal',soTotal);
			log.debug('trigger3','true');
            var total = 0;
            try {
                var invRecObj = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: salesOrderId,
                    toType: PaymentTerm,
                    isDynamic: true
                });
                total = invRecObj.getValue('total');
                var shipping = invRecObj.getValue('shippingcost');
                var shippingtax = soData.getValue('shippingtax1rate');
              	log.debug('shippingtax',shippingtax);
                var shippingamountWithTax = 0;
                if (shipping && shipping >= 0 && billedAmount <= 0) {
                    shippingamountWithTax = ((shipping / 100) * shippingtax) + shipping;
                }else if(shipping && shipping >= 0){
                    shippingamountWithTax = shipping;
                }
              	log.debug('shippingamountWithTax',shippingamountWithTax);
                var totalWithTax = shippingamountWithTax;
                var invLineCount = invRecObj.getLineCount({ sublistId: 'item' });
                for (var i = 0; i < invLineCount; i++) {

                    invRecObj.selectLine({ sublistId: 'item', line: i });
                    var itemId = invRecObj.getCurrentSublistValue({ fieldId: 'item', sublistId: 'item' });

                    log.debug('soLines.hasOwnProperty(itemId)', soLines.hasOwnProperty(itemId) + ', quantity : ' + soLines[itemId]);
                    var error = false;
                    if (soLines.hasOwnProperty(itemId)) {
                        var quantity = invRecObj.getSublistValue({ fieldId: 'quantity', sublistId: 'item', line: i });
                        if(soLines[itemId].hasOwnProperty('taxRate')){
                            var taxRate = soLines[itemId]['taxRate'];
                          	if(taxRate == 0){
                                error = true;
                                break;
                            }
                            if(soLines[itemId].hasOwnProperty('custcol_net_item_rate')){
                                var custcol_net_item_rate = soLines[itemId]['custcol_net_item_rate'];

                                var amountWithTax = ((custcol_net_item_rate/100)*taxRate) + custcol_net_item_rate;
                                totalWithTax = totalWithTax + (amountWithTax * quantity);
                            } else if(soLines[itemId].hasOwnProperty('rate')){
                                var rate = soLines[itemId]['rate'];

                                var amountWithTax = ((rate/100)*taxRate) + rate;
                                totalWithTax = totalWithTax + (amountWithTax * quantity);
                            } else {
                                var rate = invRecObj.getSublistValue({ fieldId: 'rate', sublistId: 'item', line: i });
                                if(rate){
                                    var amountWithTax = ((rate/100)*taxRate) + rate;
                                    totalWithTax = totalWithTax + (amountWithTax * quantity);
                                }else{
                                    error = true;
                                }
                            }
                        } else {
                            totalWithTax = total;
                            break;
                        }
                        if(error){
                            totalWithTax = total;
                            break;
                        }
                    }else{
                        totalWithTax = total;
                        break;
                    }
                }
              	if(totalWithTax != 0){
                  total = totalWithTax
                }
                log.error('soLines',soLines);
            }catch(e){
			log.debug('trigger5',e.message);
              	errorTransform = true;
            }
//replace custbody_hf_amount_remaining with custbodyinv_remaining_amount

            record.submitFields({
                "type": record.Type.SALES_ORDER,
                "id": salesOrderId,
                "values": {
                    "custbody_hf_billable_amount": total,
                    "custbodyinv_remaining_amount": soTotal
                }
            });
        }
  		
  		function getItemFulfillLines(recordType, recordId) {

            var itemObj = {};
            var recordObj = record.load({
                type: recordType,
                id: recordId
            });
    
            var count = recordObj.getLineCount({
                sublistId: 'item'
            });
            log.debug('count', count);
    
            for (var i = 0; i < count; i++) {
                var itemId = recordObj.getSublistValue({ fieldId: 'item', sublistId: 'item', line: i });
                var quantity = recordObj.getSublistValue({ fieldId: 'quantity', sublistId: 'item', line: i });
    
                itemObj[itemId] = quantity;
    
            }
            return itemObj;
        }

        function getLines(recordObj, line) {
            var itemObj = {};
            var count = recordObj.getLineCount({
                sublistId: line
            });
    
            for (var i = 0; i < count; i++) {
                var itemId = recordObj.getSublistValue({ fieldId: 'item', sublistId: line, line: i });
                itemObj[itemId] = {};
                var quantity = recordObj.getSublistValue({ fieldId: 'quantity', sublistId: line, line: i });
                itemObj[itemId]['quantity'] = quantity;

                var taxRate = recordObj.getSublistValue({ fieldId: 'taxrate1', sublistId: line, line: i });
                var custcol_net_item_rate = recordObj.getSublistValue({ fieldId: 'custcol_net_item_rate', sublistId: line, line: i });
              	itemObj[itemId]['custcol_net_item_rate'] = custcol_net_item_rate;
                var rate = recordObj.getSublistValue({ fieldId: 'rate', sublistId: line, line: i });
				itemObj[itemId]['rate'] = rate;
                if(taxRate){
                    itemObj[itemId]['taxRate'] = taxRate;
                }
            }
            return itemObj;
        }
        return {
            afterSubmit: afterSubmit
        }
    });
