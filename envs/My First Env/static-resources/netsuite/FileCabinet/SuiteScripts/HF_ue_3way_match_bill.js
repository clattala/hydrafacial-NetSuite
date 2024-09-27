/**
 * 
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *s
 *ss
 */
 define(['N/search', 'N/runtime', 'N/record'], function(search, runtime, record) {

  function beforeLoad(context) {
      //log.debug('beforeload is running', context)
      var functionName = 'beforeLoad'
      try {
          if (context.type == 'create') {
              var vendorBill = context.newRecord
              var createdFrom = vendorBill.getValue('podocnum');
              log.debug(functionName, 'createdFrom ' + createdFrom);
              if (createdFrom) {
                  vendorBill.setValue('custbody_hf_created_from', createdFrom)
              }
          }
      } catch (error) {
          log.debug('Error in beforeload ' + error.nessage)
      }
  }


  function afterSubmit(context) {
      try {
          log.debug('context', context)
          var functionName = 'afterSubmit'
          if ((context.type == 'create' || context.type == 'edit') && (runtime.executionContext != 'USEREVENT' || runtime.executionContext != 'WORKFLOW')) {
              var vendorBill = context.newRecord
              var vendorBillInternalId = vendorBill.id;
              var createdFrom = vendorBill.getValue('createdfrom');
              var onBehalfOf = vendorBill.getValue('custbody_hf_on_behalf_of');
              var subsidiary = vendorBill.getValue('subsidiary')
              if (subsidiary != '3' && subsidiary != '19' && subsidiary != '17') {
                  return;
              }
              log.debug(functionName, 'createdFrom ' + createdFrom);
              if (!createdFrom) {
                  createdFrom = getRelatedPurchaseOrder(vendorBillInternalId)
                  log.debug(functionName, 'createdFrom after 43' + createdFrom)
              }
              if (!onBehalfOf) { //Bills created from Requisition are skipped.
                  if (createdFrom) {

                      vendorBill = record.load({
                          type: 'vendorbill',
                          id: vendorBillInternalId,
                          isDynamic: false
                      })
                      var approvalStatus = vendorBill.getValue('approvalstatus')
                      if (approvalStatus == '1' || approvalStatus == '2') { //Pending approval
                          var poCreator = vendorBill.getValue('custbody_hf_po_creator')
                          if (!poCreator) {
                              var creator = getCreator(createdFrom)
                              log.debug('creator', creator)
                              var isCreatorInactive = isInactive(creator)
                              log.debug('isCreatorInactive', isCreatorInactive)
                              if (isCreatorInactive == false) {
                                  vendorBill.setValue('custbody_hf_po_creator', creator)
                              }

                          }
                          var subsidiary = vendorBill.getValue('subsidiary')
                          var tolerances = getSubsidiaryTolerances(subsidiary)
                          log.debug('tolerances', tolerances);
                          var receiptquantityTolerance = tolerances.receiptquantity ? tolerances.receiptquantity : 0
                          var receiptamountTolerance = tolerances.receiptamount ? tolerances.receiptamount : 0
                          var poQuantityTolerance = tolerances.purchaseorderquantity ? tolerances.purchaseorderquantity : 0
                          var poAmountTolerance = tolerances.purchaseorderamount ? tolerances.purchaseorderamount : 0
                          var vbLineCount = vendorBill.getLineCount({
                              sublistId: 'item'
                          })
                          var purchaseOrder = record.load({
                              type: 'purchaseorder',
                              id: createdFrom,
                              isDynamic: false
                          });
                          var itemReceiptDetails = {}
                          var poLineCount = purchaseOrder.getLineCount({
                              sublistId: 'item'
                          })
                          log.debug('poLineCount', poLineCount)
                          var comments = ''
                          var approvalCheck = true;
                          var customRecordJson = {};
                          log.debug('vbLineCount', vbLineCount)
                          var totalVariance = 0;
                          var totalItemReceiptAmount = 0;


                          var poIRLineNumbers = getLineNumbers(vendorBillInternalId)
                          var receiptIds = poIRLineNumbers.itemReceiptIds
                          var poLines = poIRLineNumbers.poLines
                          var billLinesPO = poIRLineNumbers.billLinesPO
                          var iRBillIds = poIRLineNumbers.iRBillIds
                          log.debug('poIRLineNumbers', poIRLineNumbers)

                          if (receiptIds.length > 0) {
                              log.debug('105')
                              for (var billReceipt = 0; billReceipt < receiptIds.length; billReceipt++) {
                                  if (!(itemReceiptDetails.hasOwnProperty(receiptIds[billReceipt]))) {

                                      getItemReceiptDetails(receiptIds[billReceipt], itemReceiptDetails)
                                  } else {}

                              }
                          }
                          log.audit('billLinesPO', billLinesPO)
                          log.audit('poLines', poLines)
                          billLinesPO = billLinesPO.map(convertToInteger)
                          poLines = poLines.map(convertToInteger)

                          for (var vbLine = 0; vbLine < vbLineCount; vbLine++) {
                              var lineNumber = vbLine + 1
                              var poLineIndex = billLinesPO.indexOf(lineNumber)
                              log.debug('lineNumber ' + lineNumber, 'poLinesIndex' + poLineIndex)
                              var poLineNumber = poLines[poLineIndex]
                              var poLine = poLineNumber - 1;
                              log.debug('poLineNumber' + poLineNumber, 'poLine' + poLine)
                              var vbItem = vendorBill.getSublistValue('item', 'item', vbLine);
                              var vbAmount = vendorBill.getSublistValue('item', 'amount', vbLine);
                              var vbQuantity = vendorBill.getSublistValue('item', 'quantity', vbLine);
                              var description = vendorBill.getSublistValue('item', 'description', vbLine);
                              var billReceipts = vendorBill.getSublistValue('item', 'billreceipts', vbLine);
                              var manualQuantity = vendorBill.getSublistValue('item', 'custcol_hf_receipt_qty_manual', vbLine);
                              log.debug('manualQuantity', manualQuantity)
                              log.audit('typeof' + typeof billReceipts, billReceipts)
                              log.error('itemReceiptDetails before code.', itemReceiptDetails)

                              var logJson = {
                                  'vbItem': vbItem,
                                  'vbAmount': vbAmount,
                                  'vbQuantity': vbQuantity,
                                  'description': description
                              }
                              log.debug('json details for line ' + vbLine, logJson)
                              var poItem = purchaseOrder.getSublistValue('item', 'item', poLine);
                              if (poItem == vbItem) {
                                  var rateCheck = 'Passed';
                                  var quantityCheck = 'Passed';
                                  var poRate = purchaseOrder.getSublistValue('item', 'rate', poLine);
                                  var poAmount = purchaseOrder.getSublistValue('item', 'amount', poLine);
                                  var poQuantity = purchaseOrder.getSublistValue('item', 'quantity', poLine);
                                  var poQuantityReceived = (manualQuantity) ? manualQuantity : getItemReceiptsQuantity(itemReceiptDetails, vbLine, billReceipts, iRBillIds)
                                  var irAmount = poQuantityReceived * poRate;
                                  log.debug('irAmount', irAmount)
                                  var lineVariance = Math.abs(vbAmount - irAmount)
                                  log.debug('lineVariance ', lineVariance)
                                  totalItemReceiptAmount = totalItemReceiptAmount + irAmount;
                                  totalVariance = totalVariance + lineVariance
                                  vendorBill.setSublistValue('item', 'custcol_hf_po_rate', vbLine, poRate);
                                  vendorBill.setSublistValue('item', 'custcol_hf_po_quantity', vbLine, poQuantity);
                                  //vendorBill.setSublistValue('item', 'custcol_hf_po_amount', vbLine, poAmount);
                                  vendorBill.setSublistValue('item', 'custcol_hf_ir_quantity', vbLine, poQuantityReceived);
                                  vendorBill.setSublistValue('item', 'custcol_hf_ir_amount', vbLine, irAmount);
                                  var receiptAmountWithTolerance = irAmount + parseFloat(receiptamountTolerance)
                                  log.debug('receiptAmountWithTolerance', receiptAmountWithTolerance)
                                  var poQuantityReceivedWithTolerance = poQuantityReceived + receiptquantityTolerance * poQuantityReceived;
                                  var poQuantityWithTolerance = poQuantity + poQuantityTolerance * poQuantity
                                  var negativeReceiptAmtTolerance = irAmount - parseFloat(receiptamountTolerance)
                                  var negativePOQtyReceivedTolerance = poQuantityReceived - (receiptquantityTolerance * poQuantityReceived);
                                  var negativePOQtyWithTolerance = poQuantity - (poQuantityTolerance * poQuantity)

                                  vendorBill.setSublistValue('item', 'custcol_hf_rcpt_qty_tolerance', vbLine, poQuantityReceivedWithTolerance)
                                  vendorBill.setSublistValue('item', 'custcol_hf_rcpt_amount_tolerance', vbLine, receiptAmountWithTolerance)
                                  //vendorBill.setSublistValue('item', 'custcol_hf_po_amount_tolerance', vbLine, poAmountWithTolerance)
                                  vendorBill.setSublistValue('item', 'custcol_hf_qty_tolerance', vbLine, poQuantityWithTolerance)
                                  vendorBill.setSublistValue('item', 'custcol_below_receipt_amt_tolerance', vbLine, negativeReceiptAmtTolerance)
                                  vendorBill.setSublistValue('item', 'custcol_below_receipt_qty_tolerance', vbLine, negativePOQtyReceivedTolerance)
                                  vendorBill.setSublistValue('item', 'custcol_hf_line_variance', vbLine, lineVariance)

                                  log.debug('finish setting the values for lines ' + vbLine)
                                  if (poQuantityReceived) {
                                      if (vbQuantity > poQuantityReceivedWithTolerance) {
                                          quantityCheck = 'Fail'
                                          approvalCheck = false
                                          comments = comments + 'For line : ' + lineNumber + ' VendorBill Quantity is greater than QuantityReceived \n'
                                          log.debug('customRecordJson', customRecordJson)
                                          appendJson(customRecordJson, lineNumber, vbItem, 'RECIEVEDQTYFAIL', 'VendorBill Quantity is greater than QuantityReceived')
                                          log.audit('vb Quantity is greater than poQuantityReceivedWithTolerance for the line ' + lineNumber)
                                      }
                                      if (vbQuantity < negativePOQtyReceivedTolerance) {
                                          quantityCheck = 'Fail'
                                          approvalCheck = false
                                          comments = comments + 'For line : ' + lineNumber + ' VendorBill Quantity is lesser than QuantityReceived \n'
                                          log.debug('customRecordJson', customRecordJson)
                                          appendJson(customRecordJson, lineNumber, vbItem, 'RECIEVEDQTYFAIL', 'VendorBill Quantity is lesser than QuantityReceived')
                                          log.audit('vb Quantity is lesser than poQuantityReceivedWithTolerance for the line ' + lineNumber)
                                      }
                                  }
                                  if (vbAmount > receiptAmountWithTolerance) {
                                      rateCheck = 'Fail'
                                      approvalCheck = false
                                      log.audit('vbAmount is greater than item Receipt for the line ' + lineNumber)
                                      comments = comments + 'For line : ' + Number(lineNumber) + ' VendorBill Amount is greater than Item Receipt Amount \n'
                                      //customRecordJson[lineNumber] = 'VendorBill Rate is greater than PurchaseOrder Rate' + 'item:' + vbItem
                                      appendJson(customRecordJson, lineNumber, vbItem, 'RateCheckFailed', 'VendorBill Amount is greater than Item Receipt Amount')
                                  }
                                  if (vbAmount < negativeReceiptAmtTolerance) {
                                      rateCheck = 'Fail'
                                      approvalCheck = false
                                      log.audit('vbAmount is lesser than item Receipt for the line ' + lineNumber)
                                      comments = comments + 'For line : ' + Number(lineNumber) + ' VendorBill Amount is lesser than Item Receipt Amount \n'
                                      //customRecordJson[lineNumber] = 'VendorBill Rate is lesser than PurchaseOrder Rate' + 'item:' + vbItem
                                      appendJson(customRecordJson, lineNumber, vbItem, 'RateCheckFailed', 'VendorBill Amount is lesser than Item Receipt Amount')
                                  }

                                  vendorBill.setSublistValue('item', 'custcol_hf_quantity_check', vbLine, quantityCheck)
                                  vendorBill.setSublistValue('item', 'custcol_hf_amount_check', vbLine, rateCheck)
                              }
                          }
                          log.debug('customRecordJson', customRecordJson)
                          if (customRecordJson) {
                              var exisitngRecordJson = context.type == 'create' ? {} : getExistingCustomRecord(vendorBillInternalId)
                              createCustomRecord(customRecordJson, vendorBillInternalId, exisitngRecordJson)
                              log.debug('exisitngRecordJson', exisitngRecordJson)
                          }
                          if (approvalCheck) {
                              log.audit('3 way match pass')
                              vendorBill.setValue('approvalstatus', 2);
                              //vendorBill.setValue('custbody_hf_3_way_check_pass', true)
                              comments = '3 Way Match is Approved'
                          } else {
                              log.audit('efore')
                              log.audit('not passed')
                              log.audit('ssdda')
                              vendorBill.setValue('approvalstatus', 1);
                          }
                          log.audit('aftr 200 before approvalCheck', approvalCheck)
                          vendorBill.setValue('custbody_hf_3_way_check_pass', approvalCheck)
                          log.audit('after 201 after approvel ceck ' + comments)
                          vendorBill.setValue('custbody_hf_3way_check_commeents', comments)
                          log.audit('after 203 after custbody_hf_3way_check_commeents')
                          log.audit('totalVariance ', totalVariance)
                          log.audit('itemreceiptamount', totalItemReceiptAmount)
                          vendorBill.setValue('custbody_hf_total_variance', totalVariance)
                          vendorBill.setValue('custbody_hf_ir_total', totalItemReceiptAmount)
                          var variancePercentage = totalVariance / totalItemReceiptAmount
                          log.audit('variancePer', variancePercentage)
                          var buyerLimit = totalItemReceiptAmount * 5 / 100
                          if (buyerLimit > 5000) {
                              buyerLimit = 5000
                          }

                          log.audit('buyerLimit', buyerLimit)
                          vendorBill.setValue('custbody_hf_buyer_limit', buyerLimit)

                          vendorBill.setValue('custbody_hf_variance_percentage', variancePercentage)



                          var id = vendorBill.save();
                          log.audit('id of the vendorbill saved is ' + id)
                      }
                  }
              }
          }
      } catch (error) {
          log.audit('error in aftersubmit ' + error.message, error)
      }
  }



  function getRelatedPurchaseOrder(vendorBillId) {
      var poInternalId
      var vendorbillSearchObj = search.create({
          type: "vendorbill",
          filters: [
              ["type", "anyof", "VendBill"],
              "AND",
              ["internalidnumber", "equalto", vendorBillId],
              "AND",
              ["mainline", "is", "T"]

          ],
          columns: [
              search.createColumn({
                  name: "createdfrom",
                  label: "Created From"
              }),
              search.createColumn({
                  name: "createdfrom",
                  label: "Created From"
              }),
          ]
      });
      var searchResultCount = vendorbillSearchObj.runPaged().count;
      log.debug("vendorbillSearchObj result count", vendorbillSearchObj);
      vendorbillSearchObj.run().each(function(result) {
          log.debug('result', result)
          poInternalId = result.getValue('createdfrom')
          return false;
      });
      return poInternalId;
  }

  function appendJson(customRecordJson, lineNumber, vbItem, type, comments) {
      if (customRecordJson[lineNumber]) {
          //customRecordJson[Number(lineNumber)] = customRecordJson[Number(lineNumber)] + '\n' + 'VendorBill Quantity is greater than QuantityReceived' + 'item:' + vbItem
          var previousJson = customRecordJson[lineNumber]
          var prevComments = previousJson.comments;
          var prevType = previousJson.type
          log.debug('previousJson', previousJson)
          log.debug('prevComments ' + prevComments, 'prevType ' + prevType)
          customRecordJson[lineNumber] = {
              "comments": prevComments + '\n' + comments,
              "item": vbItem,
              "type": prevType + '\n' + type
          }

      } else {
          customRecordJson[lineNumber] = {
              "comments": comments,
              "item": vbItem,
              "type": type
          }
      }
  }

  function createCustomRecord(customRecordJson, vendorBillId, searchResultsJson) {
      var arr_Line = Object.keys(customRecordJson)

      if (arr_Line.length > 0) {
          for (var i = 0; i < arr_Line.length; i++) {
              var lineNumber = arr_Line[i]
              var custRecordDetails = customRecordJson[lineNumber]
              var presentComments = custRecordDetails.comments;
              var presentType = custRecordDetails.type
              var item = custRecordDetails.item

              if (searchResultsJson.hasOwnProperty(lineNumber)) {
                  var existingCustomRecordJson = searchResultsJson[lineNumber]
                  var existingComments = existingCustomRecordJson.comments;
                  var existingType = existingCustomRecordJson.type
                  var internalId = existingCustomRecordJson.internalid
                  log.debug('existingType ' + existingType, 'existingComments ' + existingComments)
                  if (existingType != presentType || existingComments != presentComments) {
                      log.debug('updating since values changed')
                      updateRecord(presentType, presentComments, internalId)
                  }


              } else {
                  createRecord(item, presentType, lineNumber, vendorBillId, presentComments)
              }
          }
      }

  }

  function updateRecord(presentType, presentComments, internalId) {
      record.submitFields({
          type: 'customrecord_3way_match_errors',
          id: internalId,
          values: {
              'custrecord_3way_match_type': presentType,
              'custrecord_3way_match_comments': presentComments
          }
      })
  }

  function createRecord(item, type, lineNumber, vendorBillId, comments) {
      var threeWayMatchInfoRecord = record.create({
          type: 'customrecord_3way_match_errors'
      })
      threeWayMatchInfoRecord.setValue('custrecord_3way_match_item', item)
      threeWayMatchInfoRecord.setValue('custrecord_3way_match_type', type)
      threeWayMatchInfoRecord.setValue('custrecord_3way_match_line', lineNumber)
      threeWayMatchInfoRecord.setValue('custrecord_3way_match_bill', vendorBillId)
      threeWayMatchInfoRecord.setValue('custrecord_3way_match_comments', comments)
      threeWayMatchInfoRecord.save();
  }

  function getExistingCustomRecord(vendorBillId) {
      var customrecord_3way_match_errorsSearchObj = search.create({
          type: "customrecord_3way_match_errors",
          filters: [
              ["custrecord_3way_match_bill", "anyof", vendorBillId]
          ],
          columns: [
              search.createColumn({
                  name: "scriptid",
                  sort: search.Sort.ASC,
                  label: "Script ID"
              }),
              search.createColumn({
                  name: "custrecord_3way_match_item",
                  label: "Item"
              }),
              search.createColumn({
                  name: "custrecord_3way_match_type",
                  label: "Type of Failure"
              }),
              search.createColumn({
                  name: "custrecord_3way_match_line",
                  label: "Line Number"
              }),
              search.createColumn({
                  name: "custrecord_3way_match_comments",
                  label: "Comments"
              }),
              search.createColumn({
                  name: "internalid",
                  label: "internalid"
              }),
          ]
      });
      var searchResultCount = customrecord_3way_match_errorsSearchObj.runPaged().count;
      log.debug("customrecord_3way_match_errorsSearchObj result count", searchResultCount);
      var custRecordDetails = {}
      customrecord_3way_match_errorsSearchObj.run().each(function(result) {
          // .run().each has a limit of 4,000 results
          var lineNumber = result.getValue('custrecord_3way_match_line')
          var vbItem = result.getValue('custrecord_3way_match_item');
          var comments = result.getValue('custrecord_3way_match_comments')
          var type = result.getValue('custrecord_3way_match_type');
          custRecordDetails[lineNumber] = {
              "comments": comments,
              "item": vbItem,
              "type": type,
              "internalid": result.getValue('internalid')
          }
          return true;
      });
      return custRecordDetails;

  }

  function getSubsidiaryTolerances(subsidiary) {
      var subsidiarySearchObj = search.create({
          type: "subsidiary",
          filters: [
              ["internalidnumber", "equalto", subsidiary]
          ],
          columns: [
              search.createColumn({
                  name: "receiptquantitydiff",
                  label: "Vendor Bill - Item Receipt Quantity Difference"
              }),
              search.createColumn({
                  name: "receiptamount",
                  label: "Vendor Bill - Item Receipt Amount Tolerance"
              }),
              search.createColumn({
                  name: "receiptquantity",
                  label: "Vendor Bill - Item Receipt Quantity Tolerance"
              }),
              search.createColumn({
                  name: "purchaseorderamount",
                  label: "Vendor Bill - Purchase Order Amount Tolerance"
              }),
              search.createColumn({
                  name: "purchaseorderquantitydiff",
                  label: "Vendor Bill - Purchase Order Quantity Difference"
              }),
              search.createColumn({
                  name: "purchaseorderquantity",
                  label: "Vendor Bill - Purchase Order Quantity Tolerance"
              })
          ]
      });

      var searchResultCount = subsidiarySearchObj.runPaged().count;
      log.debug("subsidiarySearchObj result count", searchResultCount);
      var toleranceJson = {}
      subsidiarySearchObj.run().each(function(result) {
          // .run().each has a limit of 4,000 results
          var receiptquantitydiff = result.getValue('receiptquantitydiff');;
          var receiptamount = result.getValue('receiptamount');
          var receiptquantity = result.getValue('receiptquantity');
          var purchaseorderamount = result.getValue('purchaseorderamount');
          var purchaseorderquantitydiff = result.getValue('purchaseorderquantitydiff');
          var purchaseorderquantity = result.getValue('purchaseorderquantity');
          toleranceJson.receiptquantitydiff = receiptquantitydiff
          toleranceJson.receiptamount = receiptamount
          toleranceJson.receiptquantity = receiptquantity
          toleranceJson.purchaseorderamount = purchaseorderamount
          toleranceJson.purchaseorderquantitydiff = purchaseorderquantitydiff
          toleranceJson.purchaseorderquantity = purchaseorderquantity
          return true;
      });
      return toleranceJson;
  }

  function getItemReceiptDetails(itemReceiptId, itemReceiptDetails) {
      var arr_itemReceiptDetails = [];
      var obj_itemReceiptDetails = {}
      var itemReceipt = record.load({
          type: 'itemreceipt',
          id: itemReceiptId,
          isDynamic: false
      });

      var itemReceiptLine = itemReceipt.getLineCount({
          sublistId: 'item'
      })
      log.debug('itemReceiptLine', itemReceiptLine)

      for (var irLine = 0; irLine < itemReceiptLine; irLine++) {
          var receiptItem = itemReceipt.getSublistValue('item', 'item', irLine);
          var receiptQuantity = itemReceipt.getSublistValue('item', 'quantity', irLine);
          arr_itemReceiptDetails.push({
              'item': receiptItem,
              'quantity': receiptQuantity,
              'lineNumber': irLine
          })
      }
      itemReceiptDetails[itemReceiptId] = arr_itemReceiptDetails

      log.debug('itemReceiptDetails', itemReceiptDetails);
      return itemReceiptDetails
  }


  function getItemReceiptsQuantity(itemReceiptDetails, lineNumbertoCompare, billReceipts, iRBillIds) {
      /*var keys = Object.keys(itemReceiptDetails)
      var quantity = 0
      //print(keys)
      log.error('billReceipts', billReceipts)
      for (var i = 0; i < keys.length; i++) {
          if (billReceipts.indexOf(keys[i]) != -1) {
              var jsonObj = itemReceiptDetails[keys[i]]

              for (var j = 0; j < jsonObj.length; j++) {
                  if (jsonObj[j].lineNumber == lineNumbertoCompare) {
                      quantity = quantity + jsonObj[j].quantity
                  }
              }
          } else {
              log.error('ese part ' + lineNumbertoCompare, keys[i])
          }
      }*/
      var quantity = 0

      lineNumbertoCompare = lineNumbertoCompare + 1;
      var lineNumberJson = iRBillIds[lineNumbertoCompare]
      log.error('lineNumberJson ', lineNumberJson)
      if (lineNumberJson.indexOf(':') == -1) {
          //this means only one IR is applied 
          var [itemReceiptNumber, itemReceiptLineNumber] = lineNumberJson.split(',')
          itemReceiptLineNumber = itemReceiptLineNumber - 1;
          var itemReceiptJson = itemReceiptDetails[itemReceiptNumber]
          quantity = itemReceiptJson[itemReceiptLineNumber].quantity
          log.debug('quantity', quantity)
      } else {
          log.error('Multiple IR line number ' + lineNumbertoCompare)
          lineNumberJson = lineNumberJson.split(':')

          for (var i = 0; i < lineNumberJson.length; i++) {
              var itemReceiptWithLine = lineNumberJson[i]
              log.debug('itemReceiptWithLine' + itemReceiptWithLine)
              var [itemReceiptNumber, itemReceiptLineNumber] = itemReceiptWithLine.split(',')
              log.debug('itemReceiptNumber' + itemReceiptNumber, 'itemReceiptLineNumber' + itemReceiptLineNumber)
              var itemReceiptJson = itemReceiptDetails[itemReceiptNumber]
              itemReceiptLineNumber = itemReceiptLineNumber - 1;
              log.debug('quantity in 603 before' + quantity, 'itemReceiptJson[itemReceiptLineNumber].quantity ' + itemReceiptJson[itemReceiptLineNumber].quantity)
              quantity = quantity + itemReceiptJson[itemReceiptLineNumber].quantity
              log.error('quantity in else ', quantity)

          }

      }
      log.error('quantitybeforeReturn for ' + lineNumbertoCompare, quantity)
      return quantity
  }

  function getCreator(internalId) {
      var purchaseorderSearchObj = search.create({
          type: "purchaseorder",
          filters: [
              ["type", "anyof", "PurchOrd"],
              "AND",
              ["internalidnumber", "equalto", internalId],
              "AND",
              ["mainline", "is", "T"]
          ],
          columns: [
              search.createColumn({
                  name: "createdby",
                  label: "Created By"
              })
          ]
      });
      var searchResultCount = purchaseorderSearchObj.runPaged().count;
      log.debug("purchaseorderSearchObj result count", searchResultCount);
      var creator;
      purchaseorderSearchObj.run().each(function(result) {
          // .run().each has a limit of 4,000 results
          creator = result.getValue('createdby')
          return true;

      })
      return creator;
  }

  function getLineNumbers(internalId) {
      var vendorbillSearchObj = search.create({
          type: "vendorbill",
          filters: [
              ["type", "anyof", "VendBill"],
              "AND",
              ["internalid", "anyof", internalId]
          ],
          columns: [
              search.createColumn({
                  name: "tranid",
                  label: "Document Number"
              }),
              search.createColumn({
                  name: "appliedtotransaction",
                  label: "Applied To Transaction"
              }),
              search.createColumn({
                  name: "line",
                  join: "appliedToTransaction",
                  label: "Line ID"
              }),
              search.createColumn({
                  name: "line",
                  label: "Bill level Line ID"
              }),
              search.createColumn({
                  name: "type",
                  join: "appliedToTransaction",
                  label: "Type"
              })
          ]
      });
      var searchResultCount = vendorbillSearchObj.runPaged().count;
      log.debug("vendorbillSearchObj result count", searchResultCount);
      var billLinesPO = [];
      var poLines = [];
      var iRBillIds = {}
      var itemReceiptIds = [];
      var lineDetails = {}
      vendorbillSearchObj.run().each(function(result) {
          var billLevelLineId = result.getValue('line')
          var appliedTransactionLine = result.getValue({
              name: 'line',
              join: 'appliedToTransaction'
          });
          var appliedTransactionType = result.getValue({
              name: 'type',
              join: 'appliedToTransaction'
          });
          var appliedTo = result.getValue({
              name: 'appliedtotransaction'
          });
          // log.debug('appliedTo' , appliedTo)
          //log.debug('appliedTransactionType' , appliedTransactionType)
          if (appliedTransactionType == 'PurchOrd') {
              billLinesPO.push(billLevelLineId)
              poLines.push(appliedTransactionLine)
          } else if (appliedTransactionType == 'ItemRcpt') {
              if (itemReceiptIds.indexOf(appliedTo) == -1) {
                  itemReceiptIds.push(appliedTo)
              }
              if (iRBillIds[billLevelLineId]) {
                  var existingJsonValue = iRBillIds[billLevelLineId]
                  var currentJsonValue = appliedTo + ',' + appliedTransactionLine
                  log.debug('existingJsonValue', existingJsonValue)
                  log.debug('currentJsonValue', currentJsonValue)
                  if (existingJsonValue.indexOf(currentJsonValue) == -1) {
                      iRBillIds[billLevelLineId] = existingJsonValue + ':' + currentJsonValue
                  }
              } else {
                  iRBillIds[billLevelLineId] = appliedTo + ',' + appliedTransactionLine
              }
          }
          return true;
      });
      lineDetails.iRBillIds = iRBillIds
      lineDetails.billLinesPO = billLinesPO
      lineDetails.poLines = poLines
      lineDetails.itemReceiptIds = itemReceiptIds
      return lineDetails;
  }

  function convertToInteger(num) {
      return parseInt(num);
  }

  function isInactive(employeeId) {
      var employeeSearchObj = search.create({
          type: "employee",
          filters: [
              ["internalidnumber", "equalto", employeeId]
          ],
          columns: [
              search.createColumn({
                  name: "isinactive",
                  label: "Inactive"
              })
          ]
      });
      var searchResultCount = employeeSearchObj.runPaged().count;
      var isInactive = false;
      employeeSearchObj.run().each(function(result) {
          // .run().each has a limit of 4,000 results
          var isemployeeInactive = result.getValue('isinactive')
          log.debug('isemployeeInactive', isemployeeInactive)
          if (isemployeeInactive == true) {
              isInactive = true
          }

          return false;

      });

      return isInactive;
  }
  return {
      beforeLoad: beforeLoad,
      //beforeSubmit: beforeSubmit,
      afterSubmit: afterSubmit
  }
});