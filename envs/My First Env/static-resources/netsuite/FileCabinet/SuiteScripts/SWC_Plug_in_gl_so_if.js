//主方法
function customizeGlImpact(transactionRecord, standardLines, customLines, book){
    customizeGlImpactInvoice(transactionRecord, standardLines, customLines, book);
}
//库存调整单 增减分录
function customizeGlImpactInvoice(transactionRecord, standardLines, customLines, book){
    nlapiLogExecution('audit','transactionRecord',JSON.stringify(transactionRecord));
    nlapiLogExecution('audit','standardLines',JSON.stringify(standardLines));
    var createdfromId = transactionRecord.getFieldValue("createdfrom");                                     //销售
    var customerId = transactionRecord.getFieldValue("entity");                                             //客户
    var sale_order = nlapiLookupField('salesorder',createdfromId,['custbody_swc_apacsotype']);   //APAC ODER TYPE == 内部领用-检测
    if (!sale_order || sale_order.custbody_swc_apacsotype != 7 || customerId != 114654) return;


    var amountAndAccount = getMoney(standardLines);
    nlapiLogExecution('audit','standardLines',JSON.stringify(amountAndAccount))
    if(!amountAndAccount.totalAmount){return;}
    addCustomNewLine(standardLines,customLines,amountAndAccount);
}

function getMoney(standardLines) {
    var amountAndAccount = {}
    amountAndAccount.totalAmount = 0;
    amountAndAccount.debitAccount = '783';
    amountAndAccount.creditAccount = '643';
    for (var i = 0 ;i < standardLines.getCount();i++){
        var currLine = standardLines.getLine(i);
        var accountId = currLine.getAccountId();
        if (accountId == '643'){
            var costAmount = currLine.getDebitAmount();
            amountAndAccount.totalAmount += Number(costAmount);
        }
    }
    return amountAndAccount;
}


// 执行添加自定义GL Line
function addCustomNewLine(standardLines,customLines,amountAndAccount) {
    var newLine2 = customLines.addNewLine();
    newLine2.setDebitAmount(amountAndAccount.totalAmount);
    newLine2.setAccountId(Number(amountAndAccount.debitAccount));
    newLine2.setDepartmentId(105);
    newLine2.setMemo('');
    var newLine1 = customLines.addNewLine();
    newLine1.setCreditAmount(amountAndAccount.totalAmount);
    newLine1.setAccountId(Number(amountAndAccount.creditAccount));
    newLine1.setDepartmentId(117);
    newLine1.setMemo('');
}


