/**
 * 
 * Script Type: scriptType
 * Version: 0.0.1
 * @author sahilv
 * 
 /*********************************************************************************
         * JIRA  		:  NGO-3138
         * Description	: Added the logic to make the script add GL lines only on or after the specific date
         * Script Type  : Plugin 
         * Created On   : 11/11/2022 
         * Script Owner : Pavan Kaleru
         ********************************************************************************
 /****
          * JIRA  		:  SR-3254
         * Description	: CAB_Credit Memo GL Impact Change for RMA Non-Payment
         * Script Type  : Plugin 
         * Created On   : 07/11/2023 
         * Script Owner : Pavan Kaleru
         ********************************************************************************

         */
var glUtil = fnGLUtil();

/**
 * 
 * @param {nlobjRecord} transactionRecord netsuite transaction record
 * @param {Object} standardLines standard gl line
 * @param {Object} customLines customer gl line
 * @param {Object} book accounting book
 */
function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    nlapiLogExecution('debug', 'Entered');
    var type = transactionRecord.getRecordType();
    var customer = transactionRecord.getFieldValue('entity');
    nlapiLogExecution('debug', 'type', type);
    // SR-3254 Start
    if (type == 'creditmemo') {
        var createdFrom = transactionRecord.getFieldValue('createdfrom')
        nlapiLogExecution('debug', 'createdFrom', createdFrom);
        var rmaType = transactionRecord.getFieldValue('custbody_hf_rma_types');
        nlapiLogExecution('debug', 'rmaType', rmaType);

        if(createdFrom){
        var badExpense = 790;
          
        if (rmaType == '14') { //Field Text: Customer Return - Nonpayment
            for (var i = 0; i < standardLines.getCount(); i++) {
                var currLine = standardLines.getLine(i);
                var accountId = currLine.getAccountId();
                      nlapiLogExecution('debug', 'accountId', accountId);

                var debitAmount = currLine.getDebitAmount();
                var creditAmount = currLine.getCreditAmount();
                var memo = currLine.getMemo();
                nlapiLogExecution('debug', 'debitAmount ' + debitAmount, 'creditAmount ' + creditAmount);
                nlapiLogExecution('debug', 'accountId', accountId);
               
                if (debitAmount != 0 && accountId!='210') {
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(accountId);
                    newLine.setCreditAmount(debitAmount);
                    newLine.setMemo(memo)
                    newLine.setEntityId(Number(customer))

                    var anotherLine = customLines.addNewLine();
                    anotherLine.setAccountId(Number(badExpense));
                    anotherLine.setDebitAmount(debitAmount);
                    anotherLine.setMemo(memo)
                    anotherLine.setEntityId(Number(customer))

                }

            }
            return;
        }
    } //SR-3254 end


}

if (!customer) return;
var oGLAccts = srchGLDetermination(customer);
nlapiLogExecution('debug', 'oGLAccts', JSON.stringify(oGLAccts));

/** look for sales group related custom record if no customer specific mapping exists */
if (!oGLAccts.hasOwnProperty('customer')) {

    var salesgrp = nlapiLookupField('customer', customer, 'custentity_hf_salesgroup', false)
    oGLAccts = srchGLDetermination(null, salesgrp);
    if (oGLAccts.hasOwnProperty('EffectiveDate')) {
        var effectiveDate = oGLAccts.EffectiveDate;
        nlapiLogExecution('debug', 'effectiveDate in 27 ', effectiveDate);
        var check = checkEffectiveDateorNot(effectiveDate)
        nlapiLogExecution('debug', 'check in customer ', check);

        if (!check) {
            return;
        }

    }
} else {
    if (oGLAccts.hasOwnProperty('EffectiveDate')) {
        var effectiveDate = oGLAccts.EffectiveDate;
        nlapiLogExecution('debug', 'effectiveDate in 27 ', effectiveDate);
        var check = checkEffectiveDateorNot(effectiveDate)
        nlapiLogExecution('debug', 'check in salesgroup ', check);

        if (!check) {
            return;
        }

    }
}

//return if no match found
if (!oGLAccts.hasOwnProperty('customer') && !oGLAccts.hasOwnProperty('salesgrp')) return;

//var customizationRows = getTypeSpecificCustomizations(type);
// if(Number(transactionRecord.getId())===882526) return;
nlapiLogExecution('debug', 'standardLines', JSON.stringify(standardLines));

var accountIds = [];

for (var i = 0; i < standardLines.getCount(); i++) {
    var standardLine = standardLines.getLine(i);
    nlapiLogExecution('debug', 'currentStandardLine', JSON.stringify(standardLine));
    accountIds.push(standardLine.getAccountId())
}

nlapiLogExecution('debug', 'accountIds', accountIds)
var oAccountInfo = srchAccounts(accountIds)

for (var i = 0; i < standardLines.getCount(); i++) {
    var standardLine = standardLines.getLine(i);
    var lineAttr = glUtil.getLineAttributes(standardLine, 'standard')

    nlapiLogExecution('debug', 'lineAttr.accountId', lineAttr.accountId)

    var accType = oAccountInfo.hasOwnProperty(lineAttr.accountId) ? oAccountInfo[lineAttr.accountId].type : 'null';
    var fromAccount = lineAttr.accountId;
    var toAccount = oGLAccts[accType];
    var isValidAccType = ['COGS', 'Income', /*'AcctRec', 'OthCurrAsset'*/ ].indexOf(accType) !== -1 && Number(fromAccount) !== Number(toAccount) && !!toAccount;

    if (isValidAccType) {

        var applicableAmount = Number(lineAttr.credit) ? Number(lineAttr.credit) : Number(lineAttr.debit);
        var debitOrCredit = Number(lineAttr.credit) > 0 ? 'credit' : 'debit'

        if (Number(applicableAmount) > 0) {

            glUtil.addCustomLine({
                applicableAmount: applicableAmount,
                classifications: {
                    name: 0,
                    department: 0,
                    class: 0,
                    location: 0
                },
                lineAttr: lineAttr,
                customline: customLines.addNewLine(),
                standardLine: standardLine,
                accountId: fromAccount,
                debitOrCredit: debitOrCredit === 'credit' ? 'debit' : 'credit',
                isNegationLine: true
            })

            glUtil.addCustomLine({
                applicableAmount: applicableAmount,
                classifications: {
                    name: 0,
                    department: 0,
                    class: 0,
                    location: 0
                },
                lineAttr: lineAttr,
                customline: customLines.addNewLine(),
                standardLine: standardLine,
                accountId: toAccount,
                debitOrCredit: debitOrCredit === 'credit' ? 'credit' : 'debit',
                isNegationLine: false
            })

        }

    }

}

}

function srchAccounts(accountIds) {
    try {
        var searchCols = {
            name: new nlobjSearchColumn("name").setSort(false),
            displayname: new nlobjSearchColumn("displayname"),
            type: new nlobjSearchColumn("type")
        }

        var oAccountInfo = {};

        nlapiSearchRecord(
                "account",
                null,
                [
                    ["internalid", "anyof", accountIds]
                ],
                [
                    searchCols.name, searchCols.displayname, searchCols.type
                ]
            )
            .forEach(function(result) {
                var accountId = result.getId();
                if (!oAccountInfo.hasOwnProperty(accountId)) oAccountInfo[accountId] = {};
                oAccountInfo[accountId].type = result.getValue(searchCols.type);
                oAccountInfo[accountId].typeText = result.getText(searchCols.type);
                return true;
            })

        nlapiLogExecution('debug', 'srchAccounts:oAccountInfo:', JSON.stringify(oAccountInfo));
        return oAccountInfo;

    } catch (E) {
        nlapiLogExecution('error', 'srchAccounts:Error:', E)
        throw E;
    }
}

function srchGLDetermination(customer, salesgrp) {
    try {
        //var today = new Date();
        nlapiLogExecution('debug', 'srchGLDetermination', JSON.stringify({
            customer: customer,
            salesgrp: salesgrp
        }))
        var oGLAccts = {};
        if (!customer && !salesgrp) return oGLAccts;

        var searchCols = {
            customer: new nlobjSearchColumn("custrecord4"),
            salesgrp: new nlobjSearchColumn("custrecord_customer_salesgroup"),
            AcctRec: new nlobjSearchColumn("custrecord_cus_receivables_account"),
            COGS: new nlobjSearchColumn("custrecord_cus_cogs_account"),
            // OthCurrAsset: new nlobjSearchColumn("custrecord_cus_asset_inv_account"),
            Income: new nlobjSearchColumn("custrecord_cus_income_account"),
            EffectiveDate: new nlobjSearchColumn("custrecord_hf_effective_date"),
            internalId: new nlobjSearchColumn("internalid")
            // new nlobjSearchColumn("custrecord5")
        }

        var searchFilters =
            customer ? [
                ["custrecord4", "anyof", customer]
            ] : [
                ["custrecord_customer_salesgroup", "anyof", salesgrp], 'AND',
                ["custrecord4", "anyof", "@NONE@"]
            ]

        var searchResults = nlapiSearchRecord(
            "customrecord_customer_salesgroup_gldeter", null, searchFilters,
            [
                searchCols.customer,
                searchCols.salesgrp,
                searchCols.AcctRec,
                searchCols.COGS,
                // searchCols.OthCurrAsset,
                searchCols.Income,
                searchCols.EffectiveDate,
                searchCols.internalId
            ]
        )


        if (searchResults) {
            nlapiLogExecution('debug', 'searchResults length:oGLAccts:', searchResults.length);

            searchResults.forEach(function(result) {
                /*
                if(!effectiveDate){
                               nlapiLogExecution('debug', '229 effective date is not there ', effectiveDate);

                }else{
                  
				var todayDate = nlapiDateToString(today)
                nlapiLogExecution('debug', 'todayDate '  + todayDate, 'effectiveDate ' + effectiveDate);

                
              if(todayDate<effectiveDate){
                                  nlapiLogExecution('debug', 'effective date is not today', todayDate);

                    return;
              		}
                  
                  }
                                                nlapiLogExecution('debug', 'running after date ');
				*/

                oGLAccts.customer = result.getValue(searchCols.customer)
                oGLAccts.salesgrp = result.getValue(searchCols.salesgrp)
                oGLAccts.AcctRec = result.getValue(searchCols.AcctRec)
                oGLAccts.COGS = result.getValue(searchCols.COGS)
                oGLAccts.EffectiveDate = result.getValue(searchCols.EffectiveDate)
                oGLAccts.Income = result.getValue(searchCols.Income)
                oGLAccts.internalId = result.getValue(searchCols.internalId)
                //}

            })
        }

        nlapiLogExecution('debug', 'srchGLDetermination:oGLAccts:', JSON.stringify(oGLAccts));
        return oGLAccts;

    } catch (E) {
        nlapiLogExecution('error', 'srchGLDetermination:Error:', E)
        throw E;
    }
}

function checkEffectiveDateorNot(effectiveDate) {
    var today = new Date();
    nlapiLogExecution('debug', 'today:', today);

    var todayTime = today.setHours(0, 0, 0, 0)
    nlapiLogExecution('debug', 'todayTime:', todayTime);

    if (effectiveDate) {
        nlapiLogExecution('debug', 'effectiveDate is present:', effectiveDate);

        var effectiveDateTime = nlapiStringToDate(effectiveDate).setHours(0, 0, 0, 0)
        nlapiLogExecution('debug', 'effectiveDateTime   ' + effectiveDateTime, 'todayTime ' + todayTime);

        if (todayTime < effectiveDateTime) {
            return false;
        }
    }
    return true;
}

function fnGLUtil() {
    return {
        getLineAttributes: function(t, e) {
            try {
                var a = {};
                return "standard" === e && (a.id = t.getId(), a.subsidiaryId = t.getSubsidiaryId(), a.taxableAmount = t.getTaxableAmount(), a.taxAmount = t.getTaxAmount(), a.taxItemId = t.getTaxItemId(), a.taxType = t.getTaxType(), a.isPosting = t.isPosting(), a.isTaxable = t.isTaxable(), a.entityId = t.getEntityId()), a.accountId = t.getAccountId(), a.classId = t.getClassId(), a.credit = t.getCreditAmount(), a.debit = t.getDebitAmount(), a.departmentId = t.getDepartmentId(), a.locationId = t.getLocationId(), a.memo = t.getMemo(), nlapiLogExecution("debug", "lineAttr:", JSON.stringify(a)), a
            } catch (t) {
                throw nlapiLogExecution("error", "getLineAttributes:Error:", t), t
            }
        },
        addCustomLine: function(t) {
            nlapiLogExecution("debug", "addCustomLine:params", JSON.stringify(t));
            var e = t.applicableAmount,
                a = t.classifications,
                n = t.lineAttr,
                i = t.customline,
                s = t.standardLine,
                d = t.accountId,
                r = t.debitOrCredit,
                o = t.isNegationLine;
            for (var I in "credit" === r ? i.setCreditAmount(e) : i.setDebitAmount(e), i.setAccountId(parseInt(d)), i.setMemo(n.memo), a)
                if (a.hasOwnProperty(I)) {
                    var u = parseInt(a[I]);
                    if (u >= 0) switch (I) {
                        case "name":
                            0 === u || o ? Number(n.entityId) && i.setEntityId(parseInt(n.entityId)) : i.setEntityId(u);
                            break;
                        case "department":
                            0 === u || o ? Number(n.departmentId) && i.setDepartmentId(parseInt(n.departmentId)) : i.setDepartmentId(u);
                            break;
                        case "class":
                            0 === u || o ? Number(n.classId) && i.setClassId(parseInt(n.classId)) : i.setClassId(u);
                            break;
                        case "location":
                            0 === u || o ? Number(n.locationId) && i.setLocationId(parseInt(n.locationId)) : i.setLocationId(u);
                            break;
                        default:
                            if (0 === u || o) {
                                var c = s.getSegmentValueId(I);
                                Number(c) && i.setSegmentValueId(I, c)
                            } else i.setSegmentValueId(I, u)
                    }
                }
        }
    }
}