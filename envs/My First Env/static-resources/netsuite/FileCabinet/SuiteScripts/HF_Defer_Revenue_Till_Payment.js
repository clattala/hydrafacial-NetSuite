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
    // Arrays to hold the details of lines marked as 'Equip'
    var equipItems = [];
    var equipDescriptions = [];
    var equipLineTypes = [];
    var equipAmounts = []; // Store the amounts of 'Equip' lines
    var equipRevenueAccounts = []; // Store the revenue accounts of 'Equip' lines

    // Step 1: Collect information from transaction lines
    var lineCount = invoiceRecord.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') {
            // Store item, description, line type, amount, and revenue account
            equipItems.push(invoiceRecord.getLineItemValue('item', 'item', i));
            equipDescriptions.push(invoiceRecord.getLineItemValue('item', 'description', i));
            equipLineTypes.push(lineTypeValue);
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
                    var entityId = standardLine.getEntityId(); // Retrieve the entity ID associated with the line

                    // Get the entity's ID and name from the customer record
                    var customerId = nlapiLookupField('customer', entityId, 'entityid');
                    var customerName = nlapiLookupField('customer', entityId, 'companyname');
                    var entityDisplay = customerId + ' ' + customerName;

                    // Add Debit Line to reverse the revenue in the original account
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(accountId);
                    debitLine.setDebitAmount(amount);

                    // Mirror other attributes like department, class, location
                    debitLine.setDepartmentId(standardLine.getDepartmentId());
                    debitLine.setClassId(standardLine.getClassId());
                    debitLine.setLocationId(standardLine.getLocationId());
                    debitLine.setMemo(standardLine.getMemo());

                    // Add Credit Line to account 1657 (holding account)
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(1657); // Account ID for reversing the amount
                    creditLine.setCreditAmount(amount);

                    // Mirror other attributes like department, class, location
                    creditLine.setDepartmentId(standardLine.getDepartmentId());
                    creditLine.setClassId(standardLine.getClassId());
                    creditLine.setLocationId(standardLine.getLocationId());

                    // Add the entity ID and name to the memo field for reconciliation purposes
                    var creditMemo = "Reclass: " + (memo || '') + " | Customer: " + entityDisplay;
                    creditLine.setMemo(creditMemo);

                    // Log the reversal for debugging
                    nlapiLogExecution('DEBUG', 'Reversed Revenue Line', 'Memo: ' + creditMemo + ', Amount reversed: ' + amount + ', Entity ID: ' + entityId);
                }
            }
        }
    }
}

function processCustomerPayment(paymentRecord, standardLines, customLines) {
    var lineCount = paymentRecord.getLineItemCount('apply');

    // Step 1: Iterate through applied invoice lines
    for (var i = 1; i <= lineCount; i++) {
        if (paymentRecord.getLineItemValue('apply', 'apply', i) === 'T') { // Check if this line is applied
            var invoiceId = paymentRecord.getLineItemValue('apply', 'internalid', i);
            var paymentAmount = parseFloat(paymentRecord.getLineItemValue('apply', 'amount', i));

            // Load the related invoice record 
            var invoiceRecord = nlapiLoadRecord('invoice', invoiceId);

            // Calculate the percentage of 'Equip' lines for this invoice
            var equipPercentage = calculateEquipPercentage(invoiceRecord);

			nlapiLogExecution('DEBUG', 'equipPercentage', equipPercentage);
			
            
			// Calculate the amount to move from the holding account based on the 'Equip' percentage
            var debitAmount = paymentAmount * equipPercentage;
			nlapiLogExecution('DEBUG', 'Calculated Debit Amount', debitAmount);

            // Step 2 & 3: Add Debit and Credit lines for each 'Equip' line on the invoice
            var invoiceLineCount = invoiceRecord.getLineItemCount('item');
            for (var j = 1; j <= invoiceLineCount; j++) {
                var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', j);
                if (lineTypeValue === 'Equip') {
                    var lineAmount = parseFloat(invoiceRecord.getLineItemValue('item', 'amount', j));
                    var revenueAccount = parseInt(invoiceRecord.getLineItemValue('item', 'account', j), 10);

                    // Calculate the proportionate amount for this 'Equip' line
                    var lineDebitAmount = debitAmount * (lineAmount / (invoiceRecord.getFieldValue('total') || 1)); 
					
                    // Add Debit Line to the holding account (1657)
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(1657);
                    debitLine.setDebitAmount(lineDebitAmount);

                    // Add Credit Line to the original revenue account
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(revenueAccount);
                    creditLine.setCreditAmount(lineDebitAmount);

                    // Add logging for debugging
                    nlapiLogExecution('DEBUG', 'GL Impact for Customer Payment - Line ' + j, 
                                     'Debit from account 1657: ' + lineDebitAmount + 
                                     ', Credit to account ' + revenueAccount + ': ' + lineDebitAmount);
                }
            }
        }
    }
}


function calculateEquipPercentage(invoiceRecord) {
    // Custom logic to calculate the percentage of 'Equip' lines on the invoice
    var totalAmount = parseFloat(invoiceRecord.getFieldValue('total'));
    var equipAmount = 0;

    var lineCount = invoiceRecord.getLineItemCount('item');
    for (var i = 1; i <= lineCount; i++) {
        var lineTypeValue = invoiceRecord.getLineItemValue('item', 'custcol_hf_hierarchy_lvl1', i);
        if (lineTypeValue === 'Equip') { // Check if the line type is 'Equip'
            equipAmount += parseFloat(invoiceRecord.getLineItemValue('item', 'amount', i));
        }
    }

    return equipAmount / totalAmount; // Return the percentage of 'Equip' lines
}