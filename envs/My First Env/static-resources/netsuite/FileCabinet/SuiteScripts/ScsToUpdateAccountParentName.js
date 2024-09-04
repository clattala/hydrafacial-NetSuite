/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime'],
    function (search, record) {
        function executeScript(context) {

            var accountSearchObj = search.create({
                type: "account",
                filters:
                    [
                        ["custrecord_parent_name", "isempty", ""]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            accountSearchObj.run().each(function (result) {
                var parentName = '';
                var accountRecord = record.load({
                    type: 'account',
                    id: result.getValue('internalid'),
                });
                if (accountRecord.getText('parent').split(' ')[0].trim() != '') {
                    parentName = accountRecord.getText('parent').split(' ')[0];
                } else {
                    var name = accountRecord.getValue('acctname').toUpperCase();

                    switch (name) {
                        case 'ACCOUNTS PAYABLES':
                        case 'OTHER CURRENT LIABILITIES':
                        case 'LONG TERM LIABILITIES':
                            parentName = 'OFS_Total Current Liabilities';
                            break;
                        case 'INVESTMENTS':
                        case 'INVENTORY':
                        case 'OTHER CURRENT ASSETS':
                        case 'PREPAID EXPENSES':
                        case 'TAX ASSETS':
                        case 'CASH':
                            parentName = 'OFS_Total Current Assets';
                            break;
                        case 'EQUITY':
                            parentName = 'OFS_Total Equity';
                            break;
                        case 'COGS':
                            parentName = 'OFS_Total Cost Of Sales';
                            break;
                        case 'EXPENSES':
                            parentName = 'OFS_Total Expenses';
                            break;
                        case 'FA-ACCUMULATED DEPRECIATION':
                        case 'FIXED ASSETS':
                        case 'OTHER ASSETS':
                        case 'PATENTS AND TRADEMARKS':
                            parentName = 'Long Term Assets';
                            break;
                        case 'GOODWILL':
                        case 'INTANGIBLE ASSETS':
                        case 'INVESTMENTS IN SUBSIDIARIES':
                            parentName = 'Other Long Term Assets';
                            break;
                        case 'OTHER EXPENSES':
                        case 'OTHER INCOME':
                            parentName = 'Total Other Income and Expenses';
                            break;
                        case 'RECEIVABLES':
                            parentName = 'OFS_Total Receivables';
                            break;
                        case 'TOTAL REVENUE':
                            parentName = 'Sales';
                            break;
                    }
                }
                try {
                    record.submitFields({
                        type: 'account',
                        id: result.getValue('internalid'),
                        values: {
                            'custrecord_parent_name': parentName
                        }
                    });
                } catch (e) {
                    log.error('message', result.getValue('internalid') + ' -- ' + e.message);
                }
                return true;
            });
        }
        return {
            execute: executeScript
        };
    });