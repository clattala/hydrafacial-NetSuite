/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


/*********************************************************************************
 * JIRA# 		: 
 * Name 		: HF_CS_Mandatory_Dept_Alert.js 
 * Description	: To give the alert on save when the Accounts for which department is empty and which has "MAKE DEPT MANDATORY (AP BILL)" as checked on the Account Level
  * Script Type  : Client Script
 * Created On   : 09/22/2022 
 * Script Owner : Kaleru Pavan
 
*********************************************************************************/ 

define(['N/search'],


    function(search) {
		
		
        function saveRecord(context) {
            var functionName = 'saveRecord'
            try {

                var currentRecord = context.currentRecord;
                var i_LineCount = currentRecord.getLineCount('expense');
                log.debug(functionName, i_LineCount);
                var arr_accountsText = [];
              	var arr_accountsId = []
                var arr_lineNo = [];
                if (i_LineCount > 0) {
                    for (var lineNumber = 0; lineNumber < i_LineCount; lineNumber++) {
                        var department = currentRecord.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'department',
                            line: lineNumber
                        });
						log.debug('department', department)
						var accountText = currentRecord.getSublistText({
                            sublistId: 'expense',
                            fieldId: 'account',
                            line: lineNumber
                        });
                      	var accountId = currentRecord.getSublistValue({
                            sublistId: 'expense',
                            fieldId: 'account',
                            line: lineNumber
                        });
                      	log.debug('accountText ' + accountText , 'accountId ' + accountId)
                        if (!department) {
                            var correctLineNumber = lineNumber + 1;
                            arr_accountsText.push(accountText)
                            arr_lineNo.push(correctLineNumber)
                          arr_accountsId.push(accountId)
                        }
                    }
                  log.debug('arr_accountsId', arr_accountsId)
                    if (arr_accountsId.length > 0) {
                        var arr_mandatoryAccounts = mandatoryDepartmentAccounts(arr_accountsId)
                        log.debug(functionName, 'arr_mandatoryAccounts ' + arr_mandatoryAccounts);
						/*if(arr_mandatoryAccounts.length>0){
							var message = '';
							for(var acc=0;acc<arr_mandatoryAccounts.length;acc++){
								var mandatoryAccount = arr_mandatoryAccounts[acc]
								var index = arr_accounts.indexOf(mandatoryAccount)
								var lineNo = arr_lineNo[index];
								message = 'The account '  
							}
						}*/
                        if (arr_mandatoryAccounts.length > 0) {
                            Ext.Msg.alert('Alert', 'You have selected the Accounts for which the department is mandatory, Please enter the department in the line level where the below accounts are selected and save the record<br>' + arr_mandatoryAccounts.join('<br>'));
                            return false;
                        }
                        return true;
                    }
                    return true;

                }
              return true;
            } catch (error) {
                log.error(functionName + ' error message ' + error.message, error);
            }
        }

        function mandatoryDepartmentAccounts(arr_accounts) {
            var functionName = 'mandatoryDepartmentAccounts';
            var accountSearchObj = search.create({
                type: "account",
                filters: [
                    ["custrecord_hf_department_mandatory", "is", "T"],
                  	"AND",
                  	["internalid" , "anyof", arr_accounts]
                ],
                columns: [
                    search.createColumn({
                        name: "displayname",
                        sort: search.Sort.ASC,
                        label: "displayname"
                    }),
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
			
			var arr_mandatoryDepartments = [];
          
			accountSearchObj.run().each(function(result) {
                arr_mandatoryDepartments.push(result.getValue('displayname'))
                return true;
            });
            log.debug(functionName, ' arr_mandatoryDepartments ' + arr_mandatoryDepartments);
            return arr_mandatoryDepartments;
           
        }
        return {
            saveRecord: saveRecord
        };
    });