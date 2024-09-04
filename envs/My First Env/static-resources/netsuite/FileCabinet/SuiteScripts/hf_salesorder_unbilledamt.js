/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function afterSubmit(context) {
        var newrec = context.newRecord;
        var type = newrec.type;
        var salesid = newrec.id;
        log.debug("type", type + "id" + salesid);
        if (type == "salesorder") {
            var salesrec = record.load({
                type: record.Type.SALES_ORDER,
                id: salesid,
                isDynamic: true
            });
            var sublistId1 = 'links';
            var Total = Number(salesrec.getValue({ fieldId: 'total' }));
            var relreccount = salesrec.getLineCount({ sublistId: sublistId1 });
            var relrec = {};
            var billedAmount = 0.00;
            for (var i = 0; i < relreccount; i++) {
                var lineData = {
                    linkType: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'linktype', line:i })
                    , id: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'id', line:i })
                    , tranId: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'tranid', line:i })
                    , total: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'total',line:i })
                    , status: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'status',line:i })
                }
        
                if (!relrec.hasOwnProperty(lineData.id) && lineData.linkType === "Order Bill/Invoice") {
                    relrec[lineData.id] = lineData;
                    billedAmount += Number(lineData.total);
                }
            }
            var unbilledAmount = Total - billedAmount;
        
            salesrec.setValue({ fieldId: 'custbody_so_remaining_unbilled_amt', value: Number(unbilledAmount) })
            salesrec.save({
                ignoreMandatoryFields: true
            })

        }else{
            var salesid = newrec.getValue({fieldId: 'createdfrom'});
            log.debug("created from",salesid);
            if(salesid){
                var salesrec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesid,
                    isDynamic: true
                });
                var sublistId1 = 'links';
                var Total = Number(salesrec.getValue({ fieldId: 'total' }));
                var relreccount = salesrec.getLineCount({ sublistId: sublistId1 });
                var relrec = {};
                var billedAmount = 0.00;
                for (var i = 0; i < relreccount; i++) {
                    var lineData = {
                        linkType: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'linktype', line:i })
                        , id: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'id', line:i })
                        , tranId: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'tranid', line:i })
                        , total: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'total',line:i })
                        , status: salesrec.getSublistValue({ sublistId:sublistId1, fieldId: 'status',line:i })
                    }
            
                    if (!relrec.hasOwnProperty(lineData.id) && lineData.linkType === "Order Bill/Invoice") {
                        relrec[lineData.id] = lineData;
                        billedAmount += Number(lineData.total);
                    }
                }
                var unbilledAmount = Total - billedAmount;
            
                salesrec.setValue({ fieldId: 'custbody_so_remaining_unbilled_amt', value: Number(unbilledAmount) })
                salesrec.save({
                    ignoreMandatoryFields: true
                })
            }
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});
