/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 /*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-4099
Script Name   : HF_UE_SO_Set_Ship_Matrix_Account.js
Date          : 11/30/2022
Author        : Pavan Kaleru
Description   : To accomodate the changes only for the ship methods UPS and Fedex
*************************************************************
 /*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-6935
Script Name   : HF_UE_SO_Set_Ship_Matrix_Account.js
Date          : 05/11/2023
Author        : Pavan Kaleru
Description   : To set the Shipper value from the custom record
*************************************************************

 */
var SHIP_Methods = ["1730", "1731", "1725"];
var Ship_PayType_Del_Duty_Paid = 6;
var Ship_PayType_Del_Duty_Paid_3rd_Party = 5;
var Ship_PayType_Third_Party = 3;
define(['N/record', 'N/search', 'N/runtime'],
    function(record, search, runtime) {
        function beforeSubmit(context) {
            try {
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var soRecord = context.newRecord;

                    var so_ID = soRecord.id; //soRecordobj.id;
                    log.debug('so_ID', so_ID)

                    //var orderSOShipMatrixData = getOrderMatrixSearch();
                    // log.debug("orderSOShipMatrixData", orderSOShipMatrixData)
                    var isFedExOrUps = false


                    var so_OrderType = soRecord.getValue('custbody_hf_order_type');
                    var so_Ship_Account = soRecord.getValue('custbody_hf_shippayacct'); // so ship account
                    var so_ShipCountry = soRecord.getValue('shipcountry'); // so shipcountry
                    var shipMethod = soRecord.getValue('shipmethod');
                    log.debug('shipmethod', shipMethod);
                    log.debug('so_Ship_Account', so_Ship_Account)
                    if (shipMethod) {
                        shipMethod = getShipMethodName(shipMethod)
                        log.debug('shipMethod', shipMethod)
                        shipMethod = shipMethod.toLowerCase();
                        var pattern1 = /^fedex/i;
                        var pattern2 = /^ups/i;
                        log.debug('fedex present', pattern1.test(shipMethod))
                        log.debug('Ups presnt', pattern2.test(shipMethod))
                        if (pattern1.test(shipMethod) || pattern2.test(shipMethod)) {
                            isFedExOrUps = true;
                        }

                    }
                    if (isFedExOrUps == true) {
                        log.debug('isFedExOrUps', isFedExOrUps);
                        if (so_Ship_Account == null || !so_Ship_Account) {
                            if (so_OrderType == "1") {
                                if (so_ShipCountry != "US") {
                                    log.audit('ShipCountry is not US and order type is new order', isFedExOrUps);
                                    soRecord.setValue('custbody_hf_ship_pymt_type', Ship_PayType_Del_Duty_Paid);

                                }
                            } else {
                                var matrixSearch = getOrderMatrixSearch(so_OrderType)
                                log.debug('matrixSearch', matrixSearch)
                                var accountNo = matrixSearch ? matrixSearch.ship_account : null
                                log.debug('accountNo', accountNo);

                                if (accountNo) {
                                    soRecord.setValue('custbody_hf_shippayacct', accountNo);
                                } else {
                                    soRecord.setValue('custbody_hf_shippayacct', 132765030);
                                }

                                log.debug('so_ShipCountry', so_ShipCountry)
                                if (so_ShipCountry == "US") {
                                    log.audit('ShipCountry is  US and order type is other', isFedExOrUps);
                                    soRecord.setValue('custbody_hf_ship_pymt_type', Ship_PayType_Third_Party);
                                } else {
                                    log.audit('ShipCountry is  not US and order type is other', isFedExOrUps);
                                    soRecord.setValue('custbody_hf_ship_pymt_type', Ship_PayType_Del_Duty_Paid_3rd_Party);
                                }

                            }
                        } else {
                            var matrixSearch = getOrderMatrixSearch(null, so_Ship_Account)
                            log.debug('matrixSearch0 ', matrixSearch)

                            var accountNo = matrixSearch ? matrixSearch.ship_account : null
                            log.debug('accountNo', accountNo)
                            if (accountNo == null) { //we compare the present account no with matrix custom record account number if it there is any customrecord with account number it means that it is already set by script so we dont change it
                                log.debug('74 ship account is not null and we are setting ')
                                soRecord.setValue('custbody_hf_ship_pymt_type', Ship_PayType_Third_Party);
                            }
                        }
                    }

                }
            } catch (e) {
                log.debug('Error Message : ', e);
            }
        }

        function getOrderMatrixSearch(orderType, shipAccount) {
            try {
                var arr_filters =
                    orderType ? [
                        ["custrecord_hf_so_order_type", "anyof", orderType], 'AND',
                        ["isinactive", "is", "F"]
                    ] : [
                        ["custrecord_fedex_acc_no", "is", shipAccount], 'AND',
                        ["isinactive", "is", "F"]
                    ]
                log.debug('a , rr_filters', arr_filters)
                var arrResults = new Array();
                var soShip_matrix_obj = {};
                var so_Ship_MatrixSearch = search.create({
                    type: "customrecord_hf_so_ship_method_matrix",
                    filters: arr_filters,
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_so_order_type",
                            label: "SO Order Type"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_ship_payment_type",
                            label: "Ship Payment Type"
                        }),
                        search.createColumn({
                            name: "custrecord_hf_matrix_shipper_type",
                            label: "Shipper Type"
                        }),
                        search.createColumn({
                            name: "custrecord_fedex_acc_no",
                            label: "Fedex No"
                        }),

                    ]
                });

                var searchResults = [];
                var count = 0;
                var pageSize = 1000;
                var start = 0;
                searchResults = so_Ship_MatrixSearch.run().getRange({
                    start: start,
                    end: start + pageSize
                });


                log.debug('searchResults', JSON.stringify(searchResults))
                if (searchResults && searchResults.length > 0) {

                    var so_Ship_Matrix_Account = searchResults[0].getValue({
                        name: "custrecord_fedex_acc_no"
                    });
                    var shipperType = searchResults[0].getValue({
                        name: 'custrecord_hf_matrix_shipper_type'
                    })

                    log.debug('so_Ship_Matrix_Account', so_Ship_Matrix_Account)
                    return {
                        ship_account: so_Ship_Matrix_Account,
                        shipperType: shipperType
                    }


                }
                // log.debug('Saerch soShip_matrix_obj', JSON.stringify(soShip_matrix_obj))
                return null;
            } catch (ex) {
                log.error('getSearchData error: ', ex.message);
            }
        }

        function getShipMethodName(shipMethodId) {
            var shipitemSearchObj = search.create({
                type: "shipitem",
                filters: [
                    ["internalidnumber", "equalto", shipMethodId]

                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            var searchResultCount = shipitemSearchObj.runPaged().count;
            log.debug("shipitemSearchObj result count", searchResultCount);
            var shipMethodName = ''
            shipitemSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                shipMethodName = result.getValue('itemid')
                return false;
            });
            log.debug('shipMethodName', shipMethodName)
            return shipMethodName
        }
//NGO-6935 start
        function afterSubmit(context) {
            try {
                if (context.type != 'delete') {
                    var soRecord = context.newRecord;
                    var so_ID = soRecord.id; //soRecordobj.id;
                    log.debug('so_ID', so_ID)
                    soRecord = record.load({
                        type: soRecord.type,
                        id: so_ID
                    })


                    var so_OrderType = soRecord.getValue('custbody_hf_order_type');
                    var orderMatricSearch = getOrderMatrixSearch(so_OrderType)
                    log.debug('orderMatrixSearch', orderMatricSearch)
                    var shipperType = orderMatricSearch ? orderMatricSearch.shipperType : null
                    log.debug('shipperType', shipperType)
                    if (shipperType) {
                        soRecord.setValue('custbody_hf_shipper', shipperType)
                        soRecord.save();
                    }

                }
            } catch (error) {
                log.error('Error in afterSubmit  ' + error.message, JSON.stringify(error))
            }

        } //end NGO-6935
        return {
         //   beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });