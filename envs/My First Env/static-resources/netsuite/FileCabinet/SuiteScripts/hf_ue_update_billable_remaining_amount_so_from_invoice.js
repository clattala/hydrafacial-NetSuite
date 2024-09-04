/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/record', 'N/search'],
    function (record, search) {
        function afterSubmit(context) {
          	if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT)
                return;

            var recObj = context.newRecord;
            if (!recObj.id) {
                return;
            }
            log.error('id', recObj.id);
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["internalid", "anyof", recObj.id],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["createdfrom.type", "anyof", "SalesOrd"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "createdfrom", label: "Created From" }),
                        search.createColumn({
                            name: "type",
                            join: "createdFrom",
                            label: "Type"
                        })
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.error('searchResultCount', searchResultCount);
            if (searchResultCount == 0)
                return;

            //var recObj = context.newRecord;
            var salesOrderId = recObj.getValue('createdfrom');

            var soData = record.load({ type: record.Type.SALES_ORDER, id: salesOrderId });
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

            var total = 0;
            try {
                var invRecObj = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: salesOrderId,
                    toType: PaymentTerm,
                    isDynamic: true
                });
                total = Number(invRecObj.getValue('total'));
            } catch (e) { }
			//"replaced custbody_hf_amount_remaining with custbodyinv_remaining_amount

            record.submitFields({
                "type": record.Type.SALES_ORDER,
                "id": salesOrderId,
                "values": {
                    "custbodyinv_remaining_amount": soTotal,
                 	"custbody_hf_billable_amount": total
                }
            });

        }
        return {
            afterSubmit: afterSubmit
        }
    });
