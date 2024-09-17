/**
 * Custom GL Plugin Script
 * Processes invoice, customer payment, and deposit application records for revenue reversal and recognition.
 */

/**
 * Main function to handle GL impact based on transaction record type.
 * @param {nlobjRecord} transactionRecord - The transaction record being processed.
 * @param {Object} standardLines - Standard GL lines.
 * @param {Object} customLines - Custom GL lines to be created.
 * @param {Object} book - Accounting book.
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        var recordType = transactionRecord.getRecordType();
        nlapiLogExecution('DEBUG', 'RecordType', recordType);

        // Process Invoice for Revenue Reversal
        if (recordType === 'invoice') {
            processInvoice(transactionRecord, standardLines, customLines);
        }
        // Process Customer Payment for Revenue Recognition
        else if (recordType === 'customerpayment') {
            processCustomerPayment(transactionRecord, standardLines, customLines);
        }
        // Process Deposit Application for Revenue Recognition
        else if (recordType === 'depositapplication') {
            processDepositApplication(transactionRecord, standardLines, customLines);
        }
    } catch (e) {
        // Log any errors encountered during execution
        nlapiLogExecution('ERROR', 'Error in Custom GL Plugin', 'Details: ' + e.toString());
    }
}

/**
 * Process invoice to reverse revenue.
 * @param {nlobjRecord} invoiceRecord - The invoice record being processed.
 * @param {Object} standardLines - Standard GL lines.
 * @param {Object} customLines - Custom GL lines to be created.
 */
function processInvoice(invoiceRecord, standardLines, customLines) {
    var equipItems = [];
    var equipDescriptions = [];
    var equipAmounts = [];
    var equipRevenueAccounts = [];

    // Collect information from invoice lines
    var lineCount = invoiceRecord.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') {
            equipItems.push(invoiceRecord.getLineItemValue('item', 'item', i));
            equipDescriptions.push(invoiceRecord.getLineItemValue('item', 'description', i));
            equipAmounts.push(parseFloat(invoiceRecord.getLineItemValue('item', 'amount', i)));
            equipRevenueAccounts.push(parseInt(invoiceRecord.getLineItemValue('item', 'account', i), 10));
        }
    }
    nlapiLogExecution('DEBUG', 'Equipment Details',
        'Equipment Items: ' + equipItems.join(', ') + ' | ' +
        'Equipment Descriptions: ' + equipDescriptions.join(', ') + ' | ' +
        'Equipment Amounts: ' + equipAmounts.join(', ') + ' | ' +
        'Equipment Revenue Accounts: ' + equipRevenueAccounts.join(', ')
    );
  
    // Match description with memo on GL lines and reverse where matched
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

                    // Log for debugging
                    nlapiLogExecution('DEBUG', 'Reversed Revenue Line', 'Memo: ' + creditLine.getMemo() + ', Amount reversed: ' + amount + ', Entity ID: ' + entityId);
                }
            }
        }
    }
}

/**
 * Process customer payment to recognize revenue.
 * @param {nlobjRecord} paymentRecord - The customer payment record being processed.
 * @param {Object} standardLines - Standard GL lines.
 * @param {Object} customLines - Custom GL lines to be created.
 */
function processCustomerPayment(paymentRecord, standardLines, customLines) {
    var lineCount = paymentRecord.getLineItemCount('apply');
    var totalEquipAmount = 0;
    var totalInvoiceAmount = 0;
    var invoiceEquipAmounts = {};
    var invoiceRevenueAccounts = {};

    // Iterate through applied invoice lines
    for (var i = 1; i <= lineCount; i++) {
        if (paymentRecord.getLineItemValue('apply', 'apply', i) === 'T') {
            var invoiceId = paymentRecord.getLineItemValue('apply', 'internalid', i);
            var paymentAmount = parseFloat(paymentRecord.getLineItemValue('apply', 'amount', i));

            var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
            var equipPercentage = calculateEquipPercentage(invoiceRecord);
            var invoiceTotal = parseFloat(invoiceRecord.getFieldValue('total'));
            var equipAmount = equipPercentage * invoiceTotal;

            invoiceEquipAmounts[invoiceId] = equipAmount;
            invoiceRevenueAccounts[invoiceId] = getRevenueAccounts(invoiceRecord);
            totalEquipAmount += equipAmount;
            totalInvoiceAmount += invoiceTotal;

            nlapiLogExecution('DEBUG', 'Invoice Line Details',
                'Invoice ID: ' + invoiceId + ' | ' +
                'Payment Amount: ' + paymentAmount + ' | ' +
                'Equip Percentage: ' + equipPercentage + ' | ' +
                'Invoice Total: ' + invoiceTotal + ' | ' +
                'Equip Amount: ' + equipAmount
            );
          
        }
    }
    nlapiLogExecution('DEBUG', 'Totals and Mappings',
        'Total Equipment Amount: ' + totalEquipAmount + ' | ' +
        'Total Invoice Amount: ' + totalInvoiceAmount + ' | ' +
        'Invoice Equipment Amounts: ' + JSON.stringify(invoiceEquipAmounts) + ' | ' +
        'Invoice Revenue Accounts: ' + JSON.stringify(invoiceRevenueAccounts)
    );
  
    var paymentAmount = parseFloat(paymentRecord.getFieldValue('total'));
    var totalEquipPercentage = totalEquipAmount / totalInvoiceAmount;
    var debitAmount = paymentAmount * totalEquipPercentage;

    var totalDebit = 0;
    var totalCredit = 0;

    // Add Debit and Credit lines for each Equip line on the invoice
    for (var invoiceId in invoiceEquipAmounts) {
        var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
        var equipAmount = invoiceEquipAmounts[invoiceId];
        var revenueAccounts = invoiceRevenueAccounts[invoiceId];
        var lineCount = invoiceRecord.getLineItemCount('item');

        for (var j = 1; j <= lineCount; j++) {
            var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', j);
            if (lineTypeValue === 'Equip') {
                var lineAmount = parseFloat(invoiceRecord.getLineItemValue('item', 'amount', j));
                var revenueAccount = revenueAccounts[j];
                var lineDebitAmount = debitAmount * (lineAmount / equipAmount);

                // Add Debit Line to holding account (1657)
                var debitLine = customLines.addNewLine();
                debitLine.setAccountId(1657);
                debitLine.setDebitAmount(lineDebitAmount);
                debitLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                // debitLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                // debitLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Add Credit Line to original revenue account
                var creditLine = customLines.addNewLine();
                creditLine.setAccountId(revenueAccount);
                creditLine.setCreditAmount(lineDebitAmount);
                creditLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                // creditLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                // creditLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Log for debugging
                nlapiLogExecution('DEBUG', 'GL Impact for Customer Payment - Line ' + j, 
                                 'Debit from account 1657: ' + lineDebitAmount + 
                                 ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount);

                totalDebit += lineDebitAmount;
                totalCredit += lineDebitAmount;
            }
        }
    }

    // Verify that the transaction is in balance
    nlapiLogExecution('DEBUG', 'Total Debit', totalDebit);
    nlapiLogExecution('DEBUG', 'Total Credit', totalCredit);

    if (totalDebit !== totalCredit) {
        throw new Error('Transaction is out of balance. Debit: ' + totalDebit + ', Credit: ' + totalCredit);
    }
}

/**
 * Process deposit application to recognize revenue.
 * @param {nlobjRecord} depositRecord - The deposit application record being processed.
 * @param {Object} standardLines - Standard GL lines.
 * @param {Object} customLines - Custom GL lines to be created.
 */
function processDepositApplication(depositRecord, standardLines, customLines) {
    var lineCount = depositRecord.getLineItemCount('apply');
    var totalEquipAmount = 0;
    var totalInvoiceAmount = 0;
    var invoiceEquipAmounts = {};
    var invoiceRevenueAccounts = {};

    // Iterate through applied invoice lines
    for (var i = 1; i <= lineCount; i++) {
        if (depositRecord.getLineItemValue('apply', 'apply', i) === 'T') {
            var invoiceId = depositRecord.getLineItemValue('apply', 'internalid', i);
            var depositAmount = parseFloat(depositRecord.getLineItemValue('apply', 'amount', i));

            var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
            var equipPercentage = calculateEquipPercentage(invoiceRecord);
            var invoiceTotal = parseFloat(invoiceRecord.getFieldValue('total'));
            var equipAmount = equipPercentage * invoiceTotal;

            invoiceEquipAmounts[invoiceId] = equipAmount;
            invoiceRevenueAccounts[invoiceId] = getRevenueAccounts(invoiceRecord);
            totalEquipAmount += equipAmount;
            totalInvoiceAmount += invoiceTotal;

            nlapiLogExecution('DEBUG', 'Invoice Line Details',
                'Invoice ID: ' + invoiceId + ' | ' +
                'Deposit Amount: ' + depositAmount + ' | ' +
                'Equip Percentage: ' + equipPercentage + ' | ' +
                'Invoice Total: ' + invoiceTotal + ' | ' +
                'Equip Amount: ' + equipAmount
            );
          
        }
    }
    nlapiLogExecution('DEBUG', 'Totals and Mappings',
        'Total Equipment Amount: ' + totalEquipAmount + ' | ' +
        'Total Invoice Amount: ' + totalInvoiceAmount + ' | ' +
        'Invoice Equipment Amounts: ' + JSON.stringify(invoiceEquipAmounts) + ' | ' +
        'Invoice Revenue Accounts: ' + JSON.stringify(invoiceRevenueAccounts)
    );
  
    var depositAmount = parseFloat(depositRecord.getFieldValue('total'));
    var totalEquipPercentage = totalEquipAmount / totalInvoiceAmount;
    var debitAmount = depositAmount * totalEquipPercentage;

    var totalDebit = 0;
    var totalCredit = 0;

    // Add Debit and Credit lines for each Equip line on the invoice
    for (var invoiceId in invoiceEquipAmounts) {
        var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
        var equipAmount = invoiceEquipAmounts[invoiceId];
        var revenueAccounts = invoiceRevenueAccounts[invoiceId];
        var lineCount = invoiceRecord.getLineItemCount('item');

        for (var j = 1; j <= lineCount; j++) {
            var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', j);
            if (lineTypeValue === 'Equip') {
                var lineAmount = parseFloat(invoiceRecord.getLineItemValue('item', 'amount', j));
                var revenueAccount = revenueAccounts[j];
                var lineDebitAmount = debitAmount * (lineAmount / equipAmount);

                // Add Debit Line to holding account (1657)
                var debitLine = customLines.addNewLine();
                debitLine.setAccountId(1657);
                debitLine.setDebitAmount(lineDebitAmount);
                debitLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                // debitLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                // debitLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Add Credit Line to original revenue account
                var creditLine = customLines.addNewLine();
                creditLine.setAccountId(revenueAccount);
                creditLine.setCreditAmount(lineDebitAmount);
                creditLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                // creditLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                // creditLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Log for debugging
                nlapiLogExecution('DEBUG', 'GL Impact for Deposit Application - Line ' + j, 
                                 'Debit from account 1657: ' + lineDebitAmount + 
                                 ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount);

                totalDebit += lineDebitAmount;
                totalCredit += lineDebitAmount;
            }
        }
    }

    // Verify that the transaction is in balance
    nlapiLogExecution('DEBUG', 'Total Debit', totalDebit);
    nlapiLogExecution('DEBUG', 'Total Credit', totalCredit);

    if (totalDebit !== totalCredit) {
        throw new Error('Transaction is out of balance. Debit: ' + totalDebit + ', Credit: ' + totalCredit);
    }
}

/**
 * Calculate the percentage of Equip lines on an invoice.
 * @param {nlobjRecord} invoiceRecord - The invoice record being processed.
 * @returns {number} - The percentage of Equip lines.
 */
function calculateEquipPercentage(invoiceRecord) {
    var totalAmount = parseFloat(invoiceRecord.getFieldValue('total'));
    var equipAmount = 0;

    var lineCount = invoiceRecord.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') {
            equipAmount += parseFloat(invoiceRecord.getLineItemValue('item', 'amount', i));
        }
    }

    return equipAmount / totalAmount;
}

/**
 * Get revenue accounts for Equip lines on an invoice.
 * @param {nlobjRecord} invoiceRecord - The invoice record being processed.
 * @returns {Object} - A mapping of line numbers to revenue accounts.
 */
function getRevenueAccounts(invoiceRecord) {
    var revenueAccounts = {};
    var lineCount = invoiceRecord.getLineItemCount('item');

    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') {
            revenueAccounts[i] = parseInt(invoiceRecord.getLineItemValue('item', 'account', i), 10);
        }
    }
    nlapiLogExecution('DEBUG', 'Revenue Accounts', JSON.stringify(revenueAccounts));
    return revenueAccounts;
}