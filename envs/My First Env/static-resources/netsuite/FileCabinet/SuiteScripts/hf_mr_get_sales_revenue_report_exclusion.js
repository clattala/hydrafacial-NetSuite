/*************************************************************
JIRA  ID      : (Case # 5088016 Update: "GL Plugin Details with Saved Search") https://hydrafacial.atlassian.net/browse/NGO-7079
Script Name   : HF | Exclude Records From Sales Revenue Report
Date          : 03/30/2023
Author        : Ayush Gehalot
UpdatedBy     : 
Description   : Mark exclude to the records from Sales Revenue Report which has GL Plugin line and total is zero.
***************************************************************/

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record'],
    function (search, record) {
        function getInputData() {
            var searchObject = search.load({
                type: 'transaction',
                id: 'customsearch_hf_sales_data_in_range_2023'
            });
            var mySearchFilter = search.createFilter({
                name: 'customgl',
                operator: search.Operator.IS,
                values: "T"
            });
            searchObject.filters.push(mySearchFilter);
            return searchObject;
        }

        function map(context) {
            try {
                let searchResult = JSON.parse(context.value);
                
                context.write({
                    key: searchResult.id,
                    value: searchResult.values
                });

            } catch (ex) {
                log.error('exception in map', ex);
            }
        }

        function reduce(context) {
            try {
                let searchResult = context.values;
                let key = context.key;
log.debug('key', key);
              	let customerSalesGroup = '';

                var searchObject = search.load({
                    type: 'transaction',
                    id: 'customsearch_hf_sales_data_in_range_2023'
                });
                var mySearchFilter = search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: [key]
                });
                searchObject.filters.push(mySearchFilter);
                var type = '';
                var resultset = searchObject.run();
                var results = resultset.getRange(0, 1000);
                var totalNetprice = 0, totalGrossLineTotal = 0, totalNetLineTotal = 0;
              	log.debug('results', results.length);
                for (var i in results) {
                    var result = results[i];
                    var netprice = result.getValue('formulacurrency');
                    var grossLineTotal = result.getValue('amount');
                    var netLineTotal = result.getValue('netamount');
                    if (customerSalesGroup == '') {
                        customerSalesGroup = result.getText({
                            name: 'custentity_hf_salesgroup',
                            join: 'customer'
                        });
                    }
                    type = result.recordType;
                    totalNetprice = (Number(totalNetprice) + Number(netprice)).toFixed(2);
                    totalGrossLineTotal = (Number(totalGrossLineTotal) + Number(grossLineTotal)).toFixed(2);
                    totalNetLineTotal = (Number(totalNetLineTotal) + Number(netLineTotal)).toFixed(2);
                }
                //log.debug('totalNetprice', totalNetprice);
                //log.debug('totalGrossLineTotal', totalGrossLineTotal);
                //log.debug('totalNetLineTotal', totalNetLineTotal);
                if(customerSalesGroup == 'Vendor' || (customerSalesGroup == 'Sales Rep' && totalGrossLineTotal == 0)){
                  log.debug('customerSalesGroup if', customerSalesGroup);
                  log.debug('totalGrossLineTotal if', totalGrossLineTotal);
                  record.submitFields({
                      "type": type,
                      "id": key,
                      "values": {
                          "custbodyexclude_sales_rev": true
                      }
                  });
                } else {
                  log.debug('customerSalesGroup else', customerSalesGroup);
               	  log.debug('totalGrossLineTotal else', totalGrossLineTotal);
                  record.submitFields({
                      "type": type,
                      "id": key,
                      "values": {
                          "custbodyexclude_sales_rev": false
                      }
                  });
                }
            } catch (ex) {
                log.error('exception in reduce', ex);
            }
        }

        function summarize(context) {
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });

