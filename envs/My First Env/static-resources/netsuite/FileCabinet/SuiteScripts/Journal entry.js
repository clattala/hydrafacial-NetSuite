/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/runtime', 'N/search', 'N/log', 'N/ui/dialog'],
    function (currentRecord, runtime, search, log, dialog) {
       
        function validateLine(context) {
           
            try {
                var currentRecord = context.currentRecord;
                var sublistName = context.sublistId;
                var myScript = runtime.getCurrentScript();
                var formType = myScript.getParameter({
                    name: 'custscript_hf_form_id'
                });
              	log.debug('formType',formType);

                  var germanySub = myScript.getParameter({
                    name: 'custscript_hf_germany_subsidiary'
                });
              	log.debug('germanySub',germanySub);

                  var franceSub = myScript.getParameter({
                    name: 'custscript_hf_france_subsidiary'
                });
              	log.debug('franceSub',franceSub);

                  var spainSub = myScript.getParameter({
                    name: 'custscript_hf_spain_subsidiary'
                });
              	log.debug('spainSub',spainSub);

                  var ukSub = myScript.getParameter({
                    name: 'custscript_hf_uk_subsidiary'
                });
              	log.debug('ukSub',ukSub);
              
                if (sublistName == "line")
                    var Form = currentRecord.getValue({
                        fieldId: 'customform'
                    });
                log.debug("Form", Form);

                var subsidiary = currentRecord.getValue({
                    fieldId: 'subsidiary'
                });
                log.debug("subsidiary", subsidiary);

                var accId = currentRecord.getCurrentSublistValue({
                    sublistId: "line",
                    fieldId: 'account'
                });
                log.debug("accId", accId);

                var accountSearchObj = search.create({
                    type: "account",
                    filters:
                        [
                            ["type", "anyof", "Expense"],
                            "AND",
                            ["number", "startswith", "6"],
                            "AND",
                            ["internalidnumber", "equalto", accId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "Name", label: "Name" }),

                        ]
                });
                var searchResultCount = accountSearchObj.runPaged().count;
                log.debug("accountSearchObj result count", searchResultCount);


                if (Form == formType && ((subsidiary == franceSub) || (subsidiary == germanySub) || (subsidiary == spainSub) || (subsidiary == ukSub))) {
                   
                    if (searchResultCount > 0) {
                          
                        var checkLoc = currentRecord.getCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'location'

                        });
                        var checkDept = currentRecord.getCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'department'

                        });
                        log.debug("checkLoc", checkLoc);
                        log.debug("checkDept", checkDept);
                        if(!checkDept || !checkLoc ){
                          alert('Please enter the location and the department to save the line')
                          return false;
                        }
                       
                    }
                }
                return true;


            }
    catch (e) {
            log.debug({
                title: "error",
                details: JSON.stringify(e.message)
            });
        }
    }
        return {
           
    validateLine: validateLine
}
}

)