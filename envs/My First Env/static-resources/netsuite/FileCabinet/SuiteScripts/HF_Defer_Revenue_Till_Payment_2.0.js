/**
 * @NApiVersion 2.x
 * @NScriptType customglplugin
 * Custom GL Plugin Script (SuiteScript 2.0)
 * Processes invoice, customer payment, and deposit application records for revenue reversal and recognition.
 */
define(['N/record', 'N/log'], function (record, log) {
    const HOLDING_ACCOUNT_ID = 1657;
    const EQUIP_TYPE = 'Equip';

    // Define custom record types
    const RECORD_TYPES = {
        INVOICE: 'custinvc',
        CUSTOMER_PAYMENT: 'custpymt',
        DEPOSIT_APPLICATION: 'custdep'
    };

    function customizeGlImpact(context) {
        try {
            var transactionRecord = context.transactionRecord;
            //var recordType = transactionRecord.getValue({ fieldId: 'type' });
            var recordType = transactionRecord.recordType;
          log.debug({ title: 'RecordType', details: recordType });

            switch(recordType) {
              //  case RECORD_TYPES.INVOICE:
                case record.Type.INVOICE:
                    processInvoice(transactionRecord, context.standardLines, context.customLines);
                    break;
                case RECORD_TYPES.CUSTOMER_PAYMENT:
                case record.Type.CUSTOMER_PAYMENT:
                    processPaymentOrDeposit(transactionRecord, context.standardLines, context.customLines, RECORD_TYPES.INVOICE);
                    break;
                case RECORD_TYPES.DEPOSIT_APPLICATION:
                case record.Type.DEPOSIT_APPLICATION:
                    processPaymentOrDeposit(transactionRecord, context.standardLines, context.customLines, record.Type.CUSTOMER_DEPOSIT);
                    break;
                default:
                    log.debug({ title: 'Unsupported Record Type', details: recordType });
            }
        } catch (e) {
            log.error({ title: 'Error in Custom GL Plugin', details: e.toString() });
        }
    }

    function processInvoice(invoiceRecord, standardLines, customLines) {
        try {
            var equipItems = [], equipDescriptions = [], equipAmounts = [], equipRevenueAccounts = [];

            var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {
                var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
                if (lineTypeValue === EQUIP_TYPE) {
                    equipItems.push(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }));
                    equipDescriptions.push(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }));
                    equipAmounts.push(parseFloatSafe(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })));
                    equipRevenueAccounts.push(parseInt(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'account', line: i }), 10));
                }
            }

            log.debug({ title: 'Equipment Details', details: 'Equipment Items: ' + equipItems.join(', ') });

            for (var j = 0; j < standardLines.count; j++) {
                var standardLine = standardLines.getLine({ index: j });
                var memo = standardLine.memo;
                var accountId = standardLine.accountId;

                for (var k = 0; k < equipDescriptions.length; k++) {
                    if (memo === equipDescriptions[k]) {
                        if (parseFloatSafe(standardLine.creditAmount) > 0) {
                            var amount = parseFloatSafe(standardLine.creditAmount);
                            var entityId = standardLine.entityId;

                            var debitLine = customLines.addNewLine();
                            debitLine.accountId = accountId;
                            debitLine.debitAmount = amount;
                            debitLine.departmentId = standardLine.departmentId;
                            debitLine.classId = standardLine.classId;
                            debitLine.locationId = standardLine.locationId;
                            debitLine.memo = memo;
							debitLine.entity = standardLine.entityId;

                            var creditLine = customLines.addNewLine();
                            creditLine.accountId = HOLDING_ACCOUNT_ID;
                            creditLine.creditAmount = amount;
                            creditLine.departmentId = standardLine.departmentId;
                            creditLine.classId = standardLine.classId;
                            creditLine.locationId = standardLine.locationId;
                            creditLine.memo = "Reclass: " + (memo || '') + " | Customer: " + entityId;
							creditLine.entity = standardLine.entityId;

                            log.debug({ title: 'Reversed Revenue Line', details: 'Memo: ' + creditLine.memo + ', Amount: ' + amount });
                        }
                    }
                }
            }
        } catch (e) {
            log.error({ title: 'Error in processInvoice', details: e.toString() });
        }
    }

    function processPaymentOrDeposit(transactionRecord, standardLines, customLines, appliedRecordType) {
        try {
            var lineCount = transactionRecord.getLineCount({ sublistId: 'apply' });
            var totalEquipAmount = 0;
            var totalAppliedAmount = 0;
            var appliedRecords = {};

            for (var i = 0; i < lineCount; i++) {
                if (transactionRecord.getSublistValue({ sublistId: 'apply', fieldId: 'apply', line: i }) === true) {
                    var appliedRecordId = transactionRecord.getSublistValue({ sublistId: 'apply', fieldId: 'internalid', line: i });
                    var appliedAmount = parseFloatSafe(transactionRecord.getSublistValue({ sublistId: 'apply', fieldId: 'amount', line: i }));

                    var appliedRecord = record.load({ type: appliedRecordType, id: appliedRecordId });
                    var equipPercentage = calculateEquipPercentage(appliedRecord);
                    var recordTotal = parseFloatSafe(appliedRecord.getValue({ fieldId: 'total' }));
                    var equipAmount = roundAmount(equipPercentage * recordTotal);

                    appliedRecords[appliedRecordId] = {
                        record: appliedRecord,
                        equipAmount: equipAmount,
                        revenueAccounts: getRevenueAccounts(appliedRecord),
                        appliedAmount: appliedAmount
                    };

                    totalEquipAmount += equipAmount;
                    totalAppliedAmount += recordTotal;

                    log.debug({
                        title: 'Applied Record Details',
                        details: 'Record ID: ' + appliedRecordId + ' | Applied Amount: ' + appliedAmount +
                                 ' | Equip Percentage: ' + equipPercentage + ' | Record Total: ' + recordTotal +
                                 ' | Equip Amount: ' + equipAmount
                    });
                }
            }

            log.debug({ title: 'Totals', details: 'Total Equipment Amount: ' + totalEquipAmount + ', Total Applied Amount: ' + totalAppliedAmount });

            var transactionTotalAmount = parseFloatSafe(transactionRecord.getValue({ fieldId: 'total' }));
            var totalEquipPercentage = totalEquipAmount / totalAppliedAmount;
            var debitAmount = roundAmount(transactionTotalAmount * totalEquipPercentage);

            var totalDebit = 0;
            var totalCredit = 0;

            for (var appliedRecordId in appliedRecords) {
                var appliedRecordData = appliedRecords[appliedRecordId];
                var appliedRecord = appliedRecordData.record;
                var equipAmount = appliedRecordData.equipAmount;
                var revenueAccounts = appliedRecordData.revenueAccounts;
                var lineCount = appliedRecord.getLineCount({ sublistId: 'item' });

                for (var j = 0; j < lineCount; j++) {
                    var lineTypeValue = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: j });
                    if (lineTypeValue === EQUIP_TYPE) {
                        var lineAmount = parseFloatSafe(appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: j }));
                        var revenueAccount = revenueAccounts[j];
                        var lineDebitAmount = roundAmount(debitAmount * (lineAmount / equipAmount));

                        var debitLine = customLines.addNewLine();
                        debitLine.accountId = HOLDING_ACCOUNT_ID;
                        debitLine.debitAmount = lineDebitAmount;
                        debitLine.departmentId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j });
                        debitLine.classId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'class', line: j });
                        debitLine.locationId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line: j });
                        debitLine.memo = "Revenue Recognition: " + appliedRecord.getValue({ fieldId: 'tranid' }) + " | Line: " + (j + 1);

                        var creditLine = customLines.addNewLine();
                        creditLine.accountId = revenueAccount;
                        creditLine.creditAmount = lineDebitAmount;
                        creditLine.departmentId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j });
                        creditLine.classId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'class', line: j });
                        creditLine.locationId = appliedRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line: j });
                        creditLine.memo = "Revenue Recognition: " + appliedRecord.getValue({ fieldId: 'tranid' }) + " | Line: " + (j + 1);

                        log.debug({
                            title: 'GL Impact for ' + (appliedRecordType === RECORD_TYPES.INVOICE ? 'Customer Payment' : 'Deposit Application') + ' - Line ' + j,
                            details: 'Debit from account ' + HOLDING_ACCOUNT_ID + ': ' + lineDebitAmount + ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount
                        });

                        totalDebit += lineDebitAmount;
                        totalCredit += lineDebitAmount;
                    }
                }
            }

            log.debug({ title: 'Total Debit', details: totalDebit });
            log.debug({ title: 'Total Credit', details: totalCredit });

            if (!isAmountEqual(totalDebit, totalCredit)) {
                throw new Error('Transaction is out of balance. Debit: ' + totalDebit + ', Credit: ' + totalCredit);
            }
        } catch (e) {
            log.error({ title: 'Error in processPaymentOrDeposit', details: e.toString() });
        }
    }

    function calculateEquipPercentage(record) {
        var totalAmount = parseFloatSafe(record.getValue({ fieldId: 'total' }));
        var equipAmount = 0;

        var lineCount = record.getLineCount({ sublistId: 'item' });
        for (var i = 0; i < lineCount; i++) {
            var lineTypeValue = record.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
            if (lineTypeValue === EQUIP_TYPE) {
                equipAmount += parseFloatSafe(record.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i }));
            }
        }

        return totalAmount !== 0 ? equipAmount / totalAmount : 0;
    }

    function getRevenueAccounts(record) {
        var revenueAccounts = {};
        var lineCount = record.getLineCount({ sublistId: 'item' });

        for (var i = 0; i < lineCount; i++) {
            var lineTypeValue = record.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
            if (lineTypeValue === EQUIP_TYPE) {
                revenueAccounts[i] = parseInt(record.getSublistValue({ sublistId: 'item', fieldId: 'account', line: i }), 10);
            }
        }
        log.debug({ title: 'Revenue Accounts', details: JSON.stringify(revenueAccounts) });
        return revenueAccounts;
    }

    function parseFloatSafe(value) {
        return parseFloat(value) || 0;
    }

    function roundAmount(amount) {
        return Math.round(amount * 100) / 100;
    }

    function isAmountEqual(amount1, amount2) {
        return Math.abs(amount1 - amount2) < 0.01;
    }

    return {
        customizeGlImpact: customizeGlImpact
    };
});