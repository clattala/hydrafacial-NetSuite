    /**
     * @NApiVersion 2.1
     * @NScriptType UserEventScript
     */
    define(['N/record', 'N/search', 'N/email','N/url','N/runtime'],
        /**
         * @param{record} record
         */
        (record,search,email,url,runtime) => {
            /**
             * Defines the function definition that is executed before record is loaded.
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
             * @param {Form} scriptContext.form - Current form
             * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
             * @since 2015.2
             */
            const beforeLoad = (scriptContext) => {
                var form = scriptContext.form;
                var newRec = scriptContext.newRecord;

                if(newRec.type == 'PURCHASE_ORDER') return;
                var sublistobj = form.getSublist({
                    id: 'expense'
                });
              // 摘要设置必填
                var memofield = sublistobj.getField({
                    id: 'memo'
                });
                memofield.isMandatory = true;
              // 类别设置必填
               var categoryfield = sublistobj.getField({
                    id: 'category'
                });
                categoryfield.isMandatory = true;
            }

            /**
             * Defines the function definition that is executed before record is submitted.
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {Record} scriptContext.oldRecord - Old record
             * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
             * @since 2015.2
             */
            const beforeSubmit = (scriptContext) => {
                var newRec = scriptContext.newRecord;
                var recType = newRec.type == "expensereport" ? "Expense Reimbursement" : "Purchase Order";
                if(newRec.type == "expensereport"){
                    log.debug("hello1",'hello1');
                    var role = newRec.getValue({
                        fieldId: 'custbody_next_appr_role'
                    });
                    if(!role) return;
                    var subsidiary = newRec.getValue({
                        fieldId: 'subsidiary'
                    });
                    var empArr = getEmpByRole(role,subsidiary);
                    if(!empArr || empArr.length<1) return;
                    var myURL = getUrl(newRec);
                    var userId= runtime.getCurrentUser().id;

                    email.send({
                        author: userId,
                        recipients: empArr,
                        subject: recType + '待您审批',
                        body:   recType + `待您审批<br><a href="${myURL}"> View Record </a></br>`,
                    });
                }else{
                    log.debug("hello",'hello');
                    var jobTitle = newRec.getValue({
                        fieldId: 'custbody_swc_jobtitle'
                    });
                    log.debug("jobTitle",jobTitle);
                    if(!jobTitle) return;
                    var subsidiary = newRec.getValue({
                        fieldId: 'subsidiary'
                    });
                    var empArr = getEmpByJobTitle(jobTitle,subsidiary);
                    log.debug("empArr",JSON.stringify(empArr));
                    if(!empArr || empArr.length<1) {
                        newRec.setValue("nextapprover",'');
                    }else{
                        log.debug("nextapprover",empArr[0]);
                        newRec.setValue("nextapprover",empArr[0]);
                    }
                }

            }

            const getUrl = (newRec) => {
                var scheme = 'https://';
                var host = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });
                var relativePath = url.resolveRecord({
                    recordType: "expensereport",
                    recordId: newRec.id,
                    isEditMode: false
                });
                return scheme + host + relativePath;
            }

            const getEmpByJobTitle = (jobTitle,subsidiary) => {
                if(!jobTitle || !subsidiary) return;
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ["access","is","T"],
                            "AND",
                            ["title","is",jobTitle],
                          
                            "AND",
                            ["internalid","noneof","53753","14487","14486"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var empArr = [];
                employeeSearchObj.run().each(function(result){
                    var empId = result.getValue({name: "internalid", label: "Internal ID"});
                    empId && empArr.push(empId);
                    return true;
                });
                return empArr;
            }

            const getEmpByRole = (role, subsidiary) => {
                if(!role || !subsidiary) return;
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters:
                        [
                            ["isinactive","is","F"],
                            "AND",
                            ["access","is","T"],
                            "AND",
                            ["role","anyof",role],
                            "AND",
                            ["subsidiary","anyof",subsidiary],
                            "AND",
                            ["internalid","noneof","8314","8315","8313"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                log.debug("employeeSearchObj result count",searchResultCount);
                var empArr = [];
                employeeSearchObj.run().each(function(result){
                    var empId = result.getValue({name: "internalid", label: "Internal ID"});
                    empId && empArr.push(empId);
                    return true;
                });
                log.debug({title: 'test', details: 'test'+"---"+JSON.stringify(empArr)});
                return empArr;
            }

            return {beforeLoad,beforeSubmit}

        });
