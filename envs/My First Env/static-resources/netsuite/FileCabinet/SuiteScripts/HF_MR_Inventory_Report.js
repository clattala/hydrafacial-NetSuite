/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/query', 'N/file', 'N/runtime'],
    function (search, query, file, runtime) {

        // generates the query columns data for assembly item ids provided
        function fetchQueryResults(itemId, locationName) {
            var arrData = [];

            var itemReport = query.create({
                type: query.Type.ITEM
            });

            var locationsJoin = itemReport.autoJoin({
                fieldId: 'locations'
            });

            var locationJoin = locationsJoin.autoJoin({
                fieldId: 'location'
            });

            var myFirstCondition = itemReport.createCondition({
                fieldId: 'id',
                operator: query.Operator.ANY_OF,
                values: [itemId.toString()]
            });

            var mySecondCondition = locationJoin.createCondition({
                fieldId: 'fullname',
                operator: query.Operator.ANY_OF,
                values: [locationName]
            });

            itemReport.condition = itemReport.and(myFirstCondition, itemReport.and(mySecondCondition));

            // Create query columns
            itemReport.columns = [
                locationJoin.createColumn({
                    fieldId: 'fullname'
                }),
                locationsJoin.createColumn({
                    fieldId: 'quantityonhand'
                }),
                locationsJoin.createColumn({
                    fieldId: 'quantitycommitted'
                })
            ];


            // Run the query
            var theResults = itemReport.run().results;

            for (var i = 0; i < theResults.length; i++) {
                var currentResult = theResults[0];
                //log.debug('currentResult', 'qty on hand = ' + currentResult.values[1] + ', qty committed = ' + currentResult.values[2]);
                arrData.push(currentResult.values[1])
                if (locationName = 'Main Whse') {
                    arrData.push(currentResult.values[2])
                }
            }

            return arrData;

        }

        // returns a json with internal id key and item name as value.
        function getUnapprovedOrdersQty(itemCode) {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["status", "anyof", "SalesOrd:A"], // A: Pending Approval
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["closed", "is", "F"],
                        "AND",
                        ["item.name", "is", itemCode.toString()]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "formulanumeric",
                            summary: "SUM",
                            formula: "{quantity}",
                            label: "Quantity "
                        }),
                    ]
            });
            var quantityUnapproved;
            salesorderSearchObj.run().each(function (result) {
                quantityUnapproved = result.getValue({ name: 'formulanumeric', summary: 'SUM' });
                return true;
            });

            return quantityUnapproved;
        }

        function getQtyCommittedNotInThisMonth(itemCode) {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["status", "anyof", "SalesOrd:E", "SalesOrd:B", "SalesOrd:D"], // E : Partially Fulfilled , B :Pending Billing/Partially Fulfilled, D: Pending Billing
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["closed", "is", "F"],
                        "AND",
                        ["item.name", "is", itemCode.toString()],
                        "AND",
                        ["formuladate", "notwithin", "thismonth"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "formulanumeric",
                            summary: "SUM",
                            formula: "NVL({quantitycommitted},0)",
                            label: "Committed Qty"
                        })
                    ]
            });

            var qtyCommittedNotinThisMonth;
            salesorderSearchObj.run().each(function (result) {
                qtyCommittedNotinThisMonth = result.getValue({ name: 'formulanumeric', summary: 'SUM' });
                return true;
            });

            return qtyCommittedNotinThisMonth;
        }



        function getInputData() {
            // returns all top level assembly items which does not have any parent assembly items
            return search.load({
                type: 'item',
                id: 'customsearch_hf_item_inventory_report'
            });
        }

        function isNull(value) {
            return (value === null) ? 0 : value;
        }

        function map(context) {

            try {

                var searchResult = JSON.parse(context.value);
                //log.debug('searchResult', searchResult);
                csvString = '';

                let itemId = searchResult.id;
                let itemName = searchResult.values["displayname"].replaceAll(",", "");
                let itemCode = searchResult.values["itemid"];
                let mainWhseQty = fetchQueryResults(itemId, 'Main Whse');
                let mainWhseOnHandQty = isNull(mainWhseQty[0]);
                let qtyCommitted = isNull(mainWhseQty[1]);
                let qtyOnUnapprovedOrders = isNull(getUnapprovedOrdersQty(itemCode));
                let qtyCommittedNotInThisMonth = isNull(getQtyCommittedNotInThisMonth(itemCode));
                let prodWhseQty = isNull(fetchQueryResults(itemId, 'Production Whse')[0]);
                let qualityWhseQty = isNull(fetchQueryResults(itemId, 'Quality Whse')[0]);
                let receivingWhseQty = isNull(fetchQueryResults(itemId, 'Receiving Whse')[0]);
                let totalQtyOtherWhse = Number(prodWhseQty) + Number(qualityWhseQty) + Number(receivingWhseQty);
                let qtyAvailInMainThisMonth = Number(mainWhseOnHandQty) - Number(qtyOnUnapprovedOrders) - (Number(qtyCommitted) - Number(qtyCommittedNotInThisMonth));
                let qtyAvailInMainWhse = Number(mainWhseOnHandQty) - Number(qtyOnUnapprovedOrders) - Number(qtyCommitted);

                csvString = itemCode + ',' +
                    itemName + ',' +
                    mainWhseOnHandQty + ',' +
                    qtyOnUnapprovedOrders + ',' +
                    qtyCommitted + ',' +
                    qtyCommittedNotInThisMonth + ',' +
                    qtyAvailInMainThisMonth + ',' +
                    qtyAvailInMainWhse + ',' +
                    qualityWhseQty + ',' +
                    receivingWhseQty + ',' +
                    prodWhseQty + ',' +
                    totalQtyOtherWhse + '\n'

                log.debug('csvString', csvString);

                context.write({
                    key: itemId,
                    value: csvString.replaceAll(null, 0)
                });


            } catch (ex) {
                log.error('exception in map', ex);
            }

        }

        function summarize(summary) {

            //var csvFile = 'BOM PARENT, ASSEMBLY ITEM PARENT NAME, SUB ASSEMBLY LVL1,SUB ASSEMBLY LVL2, SUB ASSEMBLY LVL3, SUB ASSEMBLY LVL4, SUB ASSEMBLY LVL5, COMPONENT NAME, BOM QUANTITY PER ASSEMBLY \n';
            var csvFile = 'ITEM CODE, ITEM NAME, MAIN WHSE ON HAND QTY, QTY ON UNAPPROVED ORDERS, QTY COMMITTED, QTY COMMITTED NOT IN THIS MONTH, QTY AVAILABLE IN MAIN WHSE THIS MONTH, QTY AVAILABLE IN MAIN WHSE , QUALITY WHSE ON HAND QTY, RECEIVING WHSE ON HAND QTY, PRODUCTION WHSE ON HAND QTY, TOTAL QTY IN OTHER WHSE \n';
            //QTY AVAILABLE, QTY AVAILABLE IN MAIN WHSE,
            summary.output.iterator().each(function (key, value) {
                csvFile += value;
                return true;
            });

            // retreive folder id from script parameter
            let folderId = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_inventory_report_folderid' });

            var fileObj = file.create({
                name: 'INVENTORY REPORT.csv',
                fileType: file.Type.CSV,
                contents: csvFile,
                description: 'INVENTORY REPORT',
                encoding: file.Encoding.UTF8,
                folder: folderId
            });

            fileObj.save();
            log.debug('file generated!')
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });

