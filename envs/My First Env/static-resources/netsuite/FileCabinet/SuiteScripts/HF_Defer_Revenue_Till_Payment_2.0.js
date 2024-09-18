/**
 * @NApiVersion 2.x
 * @NScriptType customglplugin
 * Custom GL Plugin Script (SuiteScript 2.0)
 * Processes invoice, customer payment, and deposit application records for revenue reversal and recognition.
 */
define(['N/record', 'N/log'], function (record, log) {
    /**
     * Main function to handle GL impact based on transaction record type.
     * @param {Object} context - The GL impact context.
     * @param {Record} context.transactionRecord - The transaction record being processed.
     * @param {Object} context.standardLines - Standard GL lines.
     * @param {Object} context.customLines - Custom GL lines to be created.
     * @param {Object} context.book - Accounting book.
     */
    function customizeGlImpact(context) {
        try {
            var transactionRecord = context.transactionRecord;
            var recordType = transactionRecord.getValue({ fieldId: 'type' });
            log.debug({ title: 'RecordType', details: recordType });

            // Process Invoice for Revenue Reversal
            if (recordType === record.Type.INVOICE) {
                processInvoice(transactionRecord, context.standardLines, context.customLines);
            }
            // Process Customer Payment for Revenue Recognition
            else if (recordType === record.Type.CUSTOMER_PAYMENT) {
                processCustomerPayment(transactionRecord, context.standardLines, context.customLines);
            }
            // Process Deposit Application for Revenue Recognition
            else if (recordType === record.Type.DEPOSIT_APPLICATION) {
                processDepositApplication(transactionRecord, context.standardLines, context.customLines);
            }
        } catch (e) {
            log.error({ title: 'Error in Custom GL Plugin', details: e.toString() });
        }
    }

    /**
     * Process invoice to reverse revenue.
     * @param {Record} invoiceRecord - The invoice record being processed.
     * @param {Object} standardLines - Standard GL lines.
     * @param {Object} customLines - Custom GL lines to be created.
     */
    function processInvoice(invoiceRecord, standardLines, customLines) {
        var equipItems = [], equipDescriptions = [], equipAmounts = [], equipRevenueAccounts = [];

        // Collect information from invoice lines
        var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });
        for (var i = 0; i < lineCount; i++) {
            var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
            if (lineTypeValue === 'Equip') {
                equipItems.push(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }));
                equipDescriptions.push(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }));
                equipAmounts.push(parseFloat(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })));
                equipRevenueAccounts.push(parseInt(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'account', line: i }), 10));
            }
        }

        log.debug({ title: 'Equipment Details', details: 'Equipment Items: ' + equipItems.join(', ') });

        // Reverse revenue for matched lines
        for (var j = 0; j < standardLines.getCount(); j++) {
            var standardLine = standardLines.getLine(j);
            var memo = standardLine.getMemo();
            var accountId = standardLine.getAccountId();

            for (var k = 0; k < equipDescriptions.length; k++) {
                if (memo === equipDescriptions[k]) {
                    if (standardLine.getCreditAmount() > 0) {
                        var amount = standardLine.getCreditAmount();
                        var entityId = standardLine.getEntityId();

                        // Add Debit Line to reverse the revenue in the original account
                        var debitLine = customLines.addNewLine();
                        debitLine.setAccountId(accountId);
                        debitLine.setDebitAmount(amount);
                        debitLine.setDepartmentId(standardLine.getDepartmentId());
                        debitLine.setClassId(standardLine.getClassId());
                        debitLine.setLocationId(standardLine.getLocationId());
                        debitLine.setMemo(standardLine.getMemo());

                        // Add Credit Line to holding account (1657)
                        var creditLine = customLines.addNewLine();
                        creditLine.setAccountId(1657);
                        creditLine.setCreditAmount(amount);
                        creditLine.setDepartmentId(standardLine.getDepartmentId());
                        creditLine.setClassId(standardLine.getClassId());
                        creditLine.setLocationId(standardLine.getLocationId());
                        creditLine.setMemo("Reclass: " + (memo || '') + " | Customer: " + entityId);

                        log.debug({ title: 'Reversed Revenue Line', details: 'Memo: ' + creditLine.getMemo() + ', Amount: ' + amount });
                    }
                }
            }
        }
    }

    /**
     * Process customer payment to recognize revenue.
     * @param {Record} paymentRecord - The customer payment record being processed.
     * @param {Object} standardLines - Standard GL lines.
     * @param {Object} customLines - Custom GL lines to be created.
     */
    function processCustomerPayment(paymentRecord, standardLines, customLines) {
        var lineCount = paymentRecord.getLineCount({ sublistId: 'apply' });
        var totalEquipAmount = 0;
        var totalInvoiceAmount = 0;
        var invoiceEquipAmounts = {};
        var invoiceRevenueAccounts = {};

        // Iterate through applied invoice lines
        for (var i = 0; i < lineCount; i++) {
            if (paymentRecord.getSublistValue({ sublistId: 'apply', fieldId: 'apply', line: i }) === true) {
                var invoiceId = paymentRecord.getSublistValue({ sublistId: 'apply', fieldId: 'internalid', line: i });
                var paymentAmount = parseFloat(paymentRecord.getSublistValue({ sublistId: 'apply', fieldId: 'amount', line: i }));

                var invoiceRecord = record.load({ type: record.Type.INVOICE, id: invoiceId });
                var equipPercentage = calculateEquipPercentage(invoiceRecord);
                var invoiceTotal = parseFloat(invoiceRecord.getValue({ fieldId: 'total' }));
                var equipAmount = equipPercentage * invoiceTotal;

                invoiceEquipAmounts[invoiceId] = equipAmount;
                invoiceRevenueAccounts[invoiceId] = getRevenueAccounts(invoiceRecord);
                totalEquipAmount += equipAmount;
                totalInvoiceAmount += invoiceTotal;

                log.debug({
                    title: 'Invoice Line Details',
                    details: 'Invoice ID: ' + invoiceId + ' | Payment Amount: ' + paymentAmount +
                             ' | Equip Percentage: ' + equipPercentage + ' | Invoice Total: ' + invoiceTotal +
                             ' | Equip Amount: ' + equipAmount
                });
            }
        }

        log.debug({ title: 'Totals and Mappings', details: 'Total Equipment Amount: ' + totalEquipAmount });

        var paymentTotalAmount = parseFloat(paymentRecord.getValue({ fieldId: 'total' }));
        var totalEquipPercentage = totalEquipAmount / totalInvoiceAmount;
        var debitAmount = paymentTotalAmount * totalEquipPercentage;

        var totalDebit = 0;
        var totalCredit = 0;

        // Add Debit and Credit lines for each Equip line on the invoice
        for (var invoiceId in invoiceEquipAmounts) {
            var invoiceRecord = record.load({ type: record.Type.INVOICE, id: invoiceId });
            var equipAmount = invoiceEquipAmounts[invoiceId];
            var revenueAccounts = invoiceRevenueAccounts[invoiceId];
            var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });

            for (var j = 0; j < lineCount; j++) {
                var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: j });
                if (lineTypeValue === 'Equip') {
                    var lineAmount = parseFloat(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: j }));
                    var revenueAccount = revenueAccounts[j];
                    var lineDebitAmount = debitAmount * (lineAmount / equipAmount);

                    // Add Debit Line to holding account (1657)
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(1657);
                    debitLine.setDebitAmount(lineDebitAmount);
                    debitLine.setDepartmentId(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j }));

                    // Add Credit Line to original revenue account
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(revenueAccount);
                    creditLine.setCreditAmount(lineDebitAmount);
                    creditLine.setDepartmentId(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j }));

                    log.debug({
                        title: 'GL Impact for Customer Payment - Line ' + j,
                        details: 'Debit from account 1657: ' + lineDebitAmount + ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount
                    });

                    totalDebit += lineDebitAmount;
                    totalCredit += lineDebitAmount;
                }
            }
        }

        // Verify that the transaction is in balance
        log.debug({ title: 'Total Debit', details: totalDebit });
        log.debug({ title: 'Total Credit', details: totalCredit });

        if (totalDebit !== totalCredit) {
            throw new Error('Transaction is out of balance. Debit: ' + totalDebit + ', Credit: ' + totalCredit);
        }
    }

    /**
     * Process deposit application to recognize revenue.
     * @param {Record} depositRecord - The deposit application record being processed.
     * @param {Object} standardLines - Standard GL lines.
     * @param {Object} customLines - Custom GL lines to be created.
     */
    function processDepositApplication(depositRecord, standardLines, customLines) {
        var lineCount = depositRecord.getLineCount({ sublistId: 'apply' });
        var totalEquipAmount = 0;
        var totalInvoiceAmount = 0;
        var invoiceEquipAmounts = {};
        var invoiceRevenueAccounts = {};

        // Iterate through applied invoice lines
        for (var i = 0; i < lineCount; i++) {
            if (depositRecord.getSublistValue({ sublistId: 'apply', fieldId: 'apply', line: i }) === true) {
                var invoiceId = depositRecord.getSublistValue({ sublistId: 'apply', fieldId: 'internalid', line: i });
                var depositAmount = parseFloat(depositRecord.getSublistValue({ sublistId: 'apply', fieldId: 'amount', line: i }));

                var invoiceRecord = record.load({ type: record.Type.INVOICE, id: invoiceId });
                var equipPercentage = calculateEquipPercentage(invoiceRecord);
                var invoiceTotal = parseFloat(invoiceRecord.getValue({ fieldId: 'total' }));
                var equipAmount = equipPercentage * invoiceTotal;

                invoiceEquipAmounts[invoiceId] = equipAmount;
                invoiceRevenueAccounts[invoiceId] = getRevenueAccounts(invoiceRecord);
                totalEquipAmount += equipAmount;
                totalInvoiceAmount += invoiceTotal;

                log.debug({
                    title: 'Invoice Line Details',
                    details: 'Invoice ID: ' + invoiceId + ' | Deposit Amount: ' + depositAmount +
                             ' | Equip Percentage: ' + equipPercentage + ' | Invoice Total: ' + invoiceTotal +
                             ' | Equip Amount: ' + equipAmount
                });
            }
        }

        log.debug({ title: 'Totals and Mappings', details: 'Total Equipment Amount: ' + totalEquipAmount });

        var depositTotalAmount = parseFloat(depositRecord.getValue({ fieldId: 'total' }));
        var totalEquipPercentage = totalEquipAmount / totalInvoiceAmount;
        var debitAmount = depositTotalAmount * totalEquipPercentage;

        var totalDebit = 0;
        var totalCredit = 0;

        // Add Debit and Credit lines for each Equip line on the invoice
        for (var invoiceId in invoiceEquipAmounts) {
            var invoiceRecord = record.load({ type: record.Type.INVOICE, id: invoiceId });
            var equipAmount = invoiceEquipAmounts[invoiceId];
            var revenueAccounts = invoiceRevenueAccounts[invoiceId];
            var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });

            for (var j = 0; j < lineCount; j++) {
                var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: j });
                if (lineTypeValue === 'Equip') {
                    var lineAmount = parseFloat(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: j }));
                    var revenueAccount = revenueAccounts[j];
                    var lineDebitAmount = debitAmount * (lineAmount / equipAmount);

                    // Add Debit Line to holding account (1657)
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(1657);
                    debitLine.setDebitAmount(lineDebitAmount);
                    debitLine.setDepartmentId(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j }));

                    // Add Credit Line to original revenue account
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(revenueAccount);
                    creditLine.setCreditAmount(lineDebitAmount);
                    creditLine.setDepartmentId(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'department', line: j }));

                    log.debug({
                        title: 'GL Impact for Deposit Application - Line ' + j,
                        details: 'Debit from account 1657: ' + lineDebitAmount + ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount
                    });

                    totalDebit += lineDebitAmount;
                    totalCredit += lineDebitAmount;
                }
            }
        }

        // Verify that the transaction is in balance
        log.debug({ title: 'Total Debit', details: totalDebit });
        log.debug({ title: 'Total Credit', details: totalCredit });

        if (totalDebit !== totalCredit) {
            throw new Error('Transaction is out of balance. Debit: ' + totalDebit + ', Credit: ' + totalCredit);
        }
    }

    /**
     * Calculate the percentage of Equip lines on an invoice.
     * @param {Record} invoiceRecord - The invoice record being processed.
     * @returns {number} - The percentage of Equip lines.
     */
    function calculateEquipPercentage(invoiceRecord) {
        var totalAmount = parseFloat(invoiceRecord.getValue({ fieldId: 'total' }));
        var equipAmount = 0;

        var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });
        for (var i = 0; i < lineCount; i++) {
            var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
            if (lineTypeValue === 'Equip') {
                equipAmount += parseFloat(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i }));
            }
        }

        return equipAmount / totalAmount;
    }

    /**
     * Get revenue accounts for Equip lines on an invoice.
     * @param {Record} invoiceRecord - The invoice record being processed.
     * @returns {Object} - A mapping of line numbers to revenue accounts.
     */
    function getRevenueAccounts(invoiceRecord) {
        var revenueAccounts = {};
        var lineCount = invoiceRecord.getLineCount({ sublistId: 'item' });

        for (var i = 0; i < lineCount; i++) {
            var lineTypeValue = invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_hierarchy_lvl1', line: i });
            if (lineTypeValue === 'Equip') {
                revenueAccounts[i] = parseInt(invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'account', line: i }), 10);
            }
        }
        log.debug({ title: 'Revenue Accounts', details: JSON.stringify(revenueAccounts) });
        return revenueAccounts;
    }

    return {
        customizeGlImpact: customizeGlImpact
    };
});