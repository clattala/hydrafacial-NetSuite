/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/search'], function(search) {
    function onRequest(context) {
        var WmsShipService = parseInt(context.request.parameters.wmsshipservice);

        if (!WmsShipService) {
            log.error("No Ship Service is passed to SuiteLet");
            context.response.write('none');
            return false;
        }
		log.error("WmsShipService", WmsShipService);
        var customrecord_hf_shipping_detailSearchObj = search.create({
            type: "customrecord_hf_shipping_detail",
            filters:
                [
                    ["custrecord_ship_description", "anyof", WmsShipService]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_ship_code", label: "shipCode" }),
                ]
        });
        var searchResultCount = customrecord_hf_shipping_detailSearchObj.runPaged().count;
        var shipCode = '';
        customrecord_hf_shipping_detailSearchObj.run().each(function (result) {
            shipCode = result.getValue('custrecord_ship_code');
            return true;
        });
        log.debug('searchResultCount', searchResultCount);
        log.debug('shipCode', shipCode);

        if(searchResultCount >= 1 && shipCode != ''){
            context.response.write(shipCode);
        }else{
            context.response.write('none');
        }
        return;
    }

    return {
        onRequest: onRequest
    };
});