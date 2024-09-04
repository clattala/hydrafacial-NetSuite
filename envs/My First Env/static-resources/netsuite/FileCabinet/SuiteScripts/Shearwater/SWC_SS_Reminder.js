/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/email', 'N/record', 'N/runtime', 'N/search','N/url'],
    /**
 * @param{email} email
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (email, record, runtime, search,url) => {
        //获取链接
        const getUrl = (newRecId,recTyep) => {
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
            var relativePath = url.resolveRecord({
                recordType: recTyep,
                recordId: newRecId,
                isEditMode: false
            });
            return scheme + host + relativePath;
        }

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            // 第二步 获取所有员工
            var allEmpObj = getAllEmp();
            log.debug({title:'allEmpObj',details: JSON.stringify(allEmpObj)});
             //第一步 获取所有未审批的 采购订单 费用报销单据 账单 发票 预付款 付款单
            var recEmpArr = getRemindRec(allEmpObj);
            log.debug({title:'recEmpArr',details: JSON.stringify(recEmpArr)});
            //第三步 根据人员合并需要通知的单据
            if(!recEmpArr || recEmpArr.length==0) return;
            var notifyContents = {};
            for(var i=0;i<recEmpArr.length;i++){
                    var oneObj = recEmpArr[i];
                    var nextAppr = oneObj.nextAppr;
                    var recId = oneObj.recId;
                    var recTranId = oneObj.recTranId;
                    var recType = oneObj.recType;
                    if(!notifyContents.hasOwnProperty(nextAppr)) notifyContents[nextAppr] = {};
                    if(!notifyContents[nextAppr].hasOwnProperty(recType)) notifyContents[nextAppr][recType] = [];
                    notifyContents[nextAppr][recType].push({recId:recId,recTranId:recTranId});
            }
            log.debug({title:'notifyContents',details: notifyContents});
            //第四步 发送邮件
            for(var emp in notifyContents){
                var singleRecObj = notifyContents[emp];
                var emailBody = '';
                for(var eachRecType in singleRecObj){
                    var recInfo = singleRecObj[eachRecType];
                    log.debug({title:'eachRecType',details: eachRecType});
                    recInfo.forEach(cv =>{
                        var oneRecId = cv.recId;
                        var myURL = getUrl(oneRecId,eachRecType);
                        var oneRecTranid = cv.recTranId;
                        var word =  `${eachRecType}----${oneRecTranid}待您审批<a href="${myURL}"> View Record </a></br>`;
                        emailBody = word + emailBody;
                    });
                }
                log.debug({title:'emailBody',details: emailBody});
                email.send({
                    author: emp,
                    recipients: emp,
                    subject: 'Notification -- Pending My Approval',
                    body:   emailBody
                });
            }

        }

//获取所有员工
        const getAllEmp = () => {
            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["access","is","T"],
                        "AND",
                        ["subsidiary","anyof","5"]
                    ],
                columns:
                    [
                        search.createColumn({name: "role", label: "Role"})
                    ]
            });
            var empObj = {};
            employeeSearchObj.run().each(function(result){
                var empId = result.id;
                var roleId = result.getValue({name: "role", label: "Role"});
                if(!empObj.hasOwnProperty(roleId))  empObj[roleId] = [];
                empObj[roleId].push(empId);
                // .run().each has a limit of 4,000 results
                return true;
            });
            return empObj;
        }

        const getRemindRec = (allEmpObj) => {
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type","anyof","PurchOrd"],
                        "AND",
                        ["approvalstatus","anyof","1"],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["subsidiary","anyof","5"],
                    ],
                columns:
                    [
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "custbody_next_appr_role", label: "Next Approver Role"}),
                        search.createColumn({
                            name: "formulatext",
                            formula: "DECODE({nextapprover.id},-1,'',{nextapprover.id})",
                            label: "Formula (Text)"
                        }),
                        search.createColumn({
                            name: "recordtype",
                            sort: search.Sort.ASC,
                            label: "Record Type"
                        })
                    ]
            });
            var resultObj = [];
            transactionSearchObj.run().each(function(result){
                var recId = result.id;
                var recTranId = result.getValue({name: "tranid"});
                var nextAppr = result.getValue({name: "formulatext"});
                var apprRole = result.getValue({name: "custbody_next_appr_role"});
                var recType = result.getValue({name: "recordtype"});
                if(!apprRole && nextAppr) {
                    resultObj.push({nextAppr:nextAppr,recId:recId,recTranId:recTranId,recType:recType});
                }else if(apprRole && !nextAppr){
                    var roleMapEmpArr = allEmpObj[apprRole];
                    for(var k=0;roleMapEmpArr && k<roleMapEmpArr.length;k++){
                        resultObj.push({nextAppr: roleMapEmpArr[k],recId:recId,recTranId:recTranId,recType:recType});
                    }
                }else if(!apprRole && !nextAppr){
                    return true;
                }
                // .run().each has a limit of 4,000 results
                return true;
            });
            return resultObj;
        }

        return {execute}

    });
