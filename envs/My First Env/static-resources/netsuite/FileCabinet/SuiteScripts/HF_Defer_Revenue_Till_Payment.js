function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        var recordType = transactionRecord.getRecordType();
        nlapiLogExecution('DEBUG', 'RecordType', recordType);

        // Logic for Invoice - Revenue Reversal
        if (recordType === 'invoice') {
            processInvoice(transactionRecord, standardLines, customLines);
        }

        // Logic for Customer Payment - Revenue Recognition
        else if (recordType === 'customerpayment') {
            processCustomerPayment(transactionRecord, standardLines, customLines);
        }
    } catch (e) {
        // Log any errors encountered during execution
        nlapiLogExecution('ERROR', 'Error in Custom GL Plugin', 'Details: ' + e.toString());
    }
}

function processInvoice(invoiceRecord, standardLines, customLines) {
    var equipItems = [];
    var equipDescriptions = [];
    var equipAmounts = [];
    var equipRevenueAccounts = [];

    // Step 1: Collect information from transaction lines
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

    // Step 2: Match description with memo on GL lines and reverse where matched
    for (var j = 0; j < standardLines.getCount(); j++) {
        var standardLine = standardLines.getLine(j);
        var memo = standardLine.getMemo();
        var accountId = standardLine.getAccountId();

        // Check if the memo matches any description from our Equip lines
        for (var k = 0; k < equipDescriptions.length; k++) {
            if (memo === equipDescriptions[k]) {
                // Found a matching GL line, now reverse the revenue
                if (standardLine.getCreditAmount() > 0) { // Ensure it's a credit line (revenue line)
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

                    // Add Credit Line to account 1657 (holding account)
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(1657);
                    creditLine.setCreditAmount(amount);
                    creditLine.setDepartmentId(standardLine.getDepartmentId());
                    creditLine.setClassId(standardLine.getClassId());
                    creditLine.setLocationId(standardLine.getLocationId());

                    // Add the entity ID and name to the memo field for reconciliation purposes
                    var creditMemo = "Reclass: " + (memo || '') + " | Customer: " + entityId;
                    creditLine.setMemo(creditMemo);

                    nlapiLogExecution('DEBUG', 'Reversed Revenue Line', 'Memo: ' + creditMemo + ', Amount reversed: ' + amount + ', Entity ID: ' + entityId);
                }
            }
        }
    }
}

function processCustomerPayment(paymentRecord, standardLines, customLines) {
    var lineCount = paymentRecord.getLineItemCount('apply');
    var totalEquipAmount = 0;
    var totalInvoiceAmount = 0;
    var invoiceEquipAmounts = {}; // To store Equip amounts by invoice
    var invoiceRevenueAccounts = {}; // To store Equip revenue accounts by invoice

    // Step 1: Iterate through applied invoice lines
    for (var i = 1; i <= lineCount; i++) {
        if (paymentRecord.getLineItemValue('apply', 'apply', i) === 'T') { // Check if this line is applied
            var invoiceId = paymentRecord.getLineItemValue('apply', 'internalid', i);
            var paymentAmount = parseFloat(paymentRecord.getLineItemValue('apply', 'amount', i));

            // Load the related invoice record 
            var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);

            // Calculate the percentage of 'Equip' lines for this invoice
            var equipPercentage = calculateEquipPercentage(invoiceRecord);

            // Store the Equip amount and revenue accounts for this invoice
            var invoiceTotal = parseFloat(invoiceRecord.getFieldValue('total'));
            var equipAmount = equipPercentage * invoiceTotal;

            invoiceEquipAmounts[invoiceId] = equipAmount;
            invoiceRevenueAccounts[invoiceId] = getRevenueAccounts(invoiceRecord);
            totalEquipAmount += equipAmount;
            totalInvoiceAmount += invoiceTotal;
        }
    }

    // Calculate the amount to move from the holding account based on the total Equip amount
    var paymentAmount = parseFloat(paymentRecord.getFieldValue('total'));
    var totalEquipPercentage = totalEquipAmount / totalInvoiceAmount;
    var debitAmount = paymentAmount * totalEquipPercentage;

    // Step 2: Add Debit and Credit lines for each Equip line on the invoice
    for (var invoiceId in invoiceEquipAmounts) {
        var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);
        var equipAmount = invoiceEquipAmounts[invoiceId];
        var revenueAccounts = invoiceRevenueAccounts[invoiceId];
        var lineCount = invoiceRecord.getLineItemCount('item');

        for (var j = 1; j <= lineCount; j++) {
            var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', j);
            if (lineTypeValue === 'Equip') {
                var lineAmount = parseFloat(invoiceRecord.getLineItemValue('item', 'amount', j));
                var revenueAccount = parseInt(invoiceRecord.getLineItemValue('item', 'account', j), 10);

                // Calculate the proportionate amount for this Equip line
                var lineDebitAmount = debitAmount * (lineAmount / equipAmount);

                // Add Debit Line to the holding account (1657)
                var debitLine = customLines.addNewLine();
                debitLine.setAccountId(1657);
                debitLine.setDebitAmount(lineDebitAmount);
                debitLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                debitLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                debitLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Add Credit Line to the original revenue account
                var creditLine = customLines.addNewLine();
                creditLine.setAccountId(revenueAccount);
                creditLine.setCreditAmount(lineDebitAmount);
                creditLine.setDepartmentId(invoiceRecord.getLineItemValue('item', 'department', j));
                creditLine.setClassId(invoiceRecord.getLineItemValue('item', 'class', j));
                creditLine.setLocationId(invoiceRecord.getLineItemValue('item', 'location', j));

                // Add logging for debugging
                nlapiLogExecution('DEBUG', 'GL Impact for Customer Payment - Line ' + j, 
                                 'Debit from account 1657: ' + lineDebitAmount + 
                                 ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount);
            }
        }
    }
}

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

function getRevenueAccounts(invoiceRecord) {
    var revenueAccounts = [];

    var lineCount = invoiceRecord.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') {
            var accountId = parseInt(invoiceRecord.getLineItemValue('item', 'account', i), 10);
            if (revenueAccounts.indexOf(accountId) === -1) {
                revenueAccounts.push(accountId);
            }
        }
    }

    return revenueAccounts;
}