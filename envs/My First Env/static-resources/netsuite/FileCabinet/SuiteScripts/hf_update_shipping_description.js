/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record','N/search'], function (record,search) {
    function beforeSubmit(context) {
        // if (context.type !== context.UserEventType.CREATE)
        //     return;
        log.debug('1', context);
        var customerRecord = context.newRecord;
        var WmsShipService = customerRecord.getValue('custbody_hf_ship_service_desc');
        log.debug('WmsShipService', WmsShipService);

        if (WmsShipService && WmsShipService != '') {
            var customrecord_hf_shipping_detailSearchObj = search.create({
                type: "customrecord_hf_shipping_detail",
                filters:
                    [
                        ["custrecord_ship_description", "anyof", WmsShipService]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_ship_code", label: "shipCode" }),
                        search.createColumn({ name: "custrecord_ship_service", label: "shipService" })
                    ]
            });
            var searchResultCount = customrecord_hf_shipping_detailSearchObj.runPaged().count;
            var shipCode = '';
            var shipService = '';
            customrecord_hf_shipping_detailSearchObj.run().each(function (result) {
                shipCode = result.getValue('custrecord_ship_code');
                shipService = result.getText('custrecord_ship_service');
                return true;
            });
            log.debug('searchResultCount', searchResultCount);
            log.debug('shipCode', shipCode);
            log.debug('shipService', shipService);
            if(searchResultCount >= 1 && shipCode != '' && shipService != ''){
                customerRecord.setValue('shipmethod',shipCode);
                customerRecord.setValue('custbody_hf_carrier_fulfillment',shipService);
            }
            
        }
        log.debug('2', context);

    }
    return {
        beforeSubmit: beforeSubmit
    };
});