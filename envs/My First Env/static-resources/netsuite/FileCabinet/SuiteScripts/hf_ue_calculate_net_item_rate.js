/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var VALID_ITEM_TYPES = ["InvtPart", "Assembly"];
var ITEM_TYPE_DISCOUNT = "Discount";
define(['N/runtime'],
    function (runtime) {
        function beforeSubmit(context) {
            var title = " beforeSubmit() ";
            log.debug(title, "<--------------- START --------------->");
            try {
                var inventoryItemsArr = [];
                var lineWeightingAmountSum = 0;
                var recObj = context.newRecord;
                var orderDiscountTotal = recObj.getValue({
                    fieldId: "discounttotal"
                }) ? Math.abs(parseFloat(recObj.getValue({
                    fieldId: "discounttotal"
                }))) : 0;

                /////
                var orderSubTotal = parseFloat(recObj.getValue({
                    fieldId: "subtotal"
                }))

                //apply currency excange rate for net item rate field
                //start
                var currentScript = runtime.getCurrentScript();
                var scriptSubsidiary =   currentScript.getParameter({name: 'custscript_hf_subsidiary_1'}).toLowerCase().split(',');
                var scriptCurrency =   currentScript.getParameter({name: 'custscript_hf_currency'}).toLowerCase().split(',');
                var subsidiary = recObj.getText({
                    fieldId: "subsidiary"
                }).toLowerCase();
                var currency = recObj.getText({
                    fieldId: "currency"
                }).toLowerCase();
                var exchangeRate = parseFloat(recObj.getValue({
                    fieldId: "exchangerate"
                }));
                if(scriptSubsidiary.indexOf(subsidiary) == -1 || scriptCurrency.indexOf(currency) == -1){
                    exchangeRate = '';
                    //if exahange rate rule not applicable for given subsidiary and currency then skip the process for that record.
                }
                log.debug("currency", currency);
                log.debug("subsidiary", subsidiary);
                log.debug("exchangeRate", exchangeRate);
                //end

                if (orderSubTotal == orderDiscountTotal) {
                    //log.debug(title + "orderDiscountTotal", orderDiscountTotal);
                    var lineCount = recObj.getLineCount({
                        sublistId: "item"
                    });
                    //log.debug(title + "lineCount", lineCount);
                    for (var i = 0; i < lineCount; i++) {
                        recObj.setSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_net_line_total",
                            value: 0,
                            line: i
                        });
                    }
                } else {

                    log.debug(title + "orderDiscountTotal", orderDiscountTotal);
                    var lineCount = recObj.getLineCount({
                        sublistId: "item"
                    });
                    log.debug(title + "lineCount", lineCount);
                    for (var i = 0; i < lineCount; i++) {
                        var itemType = recObj.getSublistValue({
                            sublistId: "item",
                            fieldId: "itemtype",
                            line: i
                        });
                        log.debug(title + "itemType", itemType);
                        if (VALID_ITEM_TYPES.indexOf(itemType) != -1) {
                            var invItemObj = {};
                            invItemObj.lineNo = i;
                            invItemObj.itemType = itemType;
                            invItemObj.itemQty = recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "quantity",
                                line: i
                            }) ? parseFloat(recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "quantity",
                                line: i
                            })) : 0;
                            invItemObj.itemRate = recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "rate",
                                line: i
                            }) ? parseFloat(recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "rate",
                                line: i
                            })) : 0;
                            invItemObj.itemAmount = recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "amount",
                                line: i
                            }) ? parseFloat(recObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "amount",
                                line: i
                            })) : 0;
                            invItemObj.discountAmount = 0;
                            if (i < (lineCount - 1)) {
                                for (var j = (i + 1); j < lineCount; j++) {
                                    var nextItemType = recObj.getSublistValue({
                                        sublistId: "item",
                                        fieldId: "itemtype",
                                        line: j
                                    });
                                    if (nextItemType == ITEM_TYPE_DISCOUNT) {
                                        invItemObj.discountAmount += recObj.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "amount",
                                            line: j
                                        }) ? Math.abs(parseFloat(recObj.getSublistValue({
                                            sublistId: "item",
                                            fieldId: "amount",
                                            line: j
                                        }))) : 0;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            invItemObj.lineWeightingAmount = invItemObj.itemAmount - invItemObj.discountAmount;
                            lineWeightingAmountSum += invItemObj.lineWeightingAmount;
                            inventoryItemsArr.push(invItemObj);
                        }
                    }

                    for (var index1 in inventoryItemsArr) {
                        var itemObj = inventoryItemsArr[index1];
                        itemObj.weighting = 0;
                        if (lineWeightingAmountSum) {
                            itemObj.weighting = Math.round((itemObj.lineWeightingAmount / lineWeightingAmountSum) * 10000) / 10000;
                        }
                        itemObj.discountCalc = Math.round((itemObj.weighting * orderDiscountTotal) * 100) / 100;
                        itemObj.netLineTotal = itemObj.lineWeightingAmount - itemObj.discountCalc;
                    }

                    log.debug(title + "inventoryItemsArr", inventoryItemsArr);
                    log.debug(title + "lineWeightingAmountSum", lineWeightingAmountSum);

                    for (var index2 in inventoryItemsArr) {
                        var itemObj = inventoryItemsArr[index2];
                        //apply currency excange rate for net item rate field
                        //start
                        if(exchangeRate != ''){
                            itemObj.netLineTotal = itemObj.netLineTotal * exchangeRate;
                        }
                        //end
                        recObj.setSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_net_line_total",
                            value: Math.round(itemObj.netLineTotal * 100) / 100,
                            line: itemObj.lineNo
                        });
                    }
                }
            } catch (e) {
                log.error("ERROR IN " + title, e);
            }
            log.debug(title, "<--------------- END --------------->");
        }
        return {
            beforeSubmit: beforeSubmit
        }
    }
);