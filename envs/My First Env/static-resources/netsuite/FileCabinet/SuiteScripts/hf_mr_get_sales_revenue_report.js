/*************************************************************
JIRA  ID      : NGO-4193 Sale Revenue Report
Script Name   : HF | IS Sales Revenue Report
Date          : 01/01/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Create Sales Revenue Report for the given period and store it in file cabinet
*************************************************************/

/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/file', 'N/runtime', 'N/record', 'N/task', 'N/email'],
    function (search, file, runtime, record, task, email) {
        let coulmnsForCsv = [
            "Posting Date",
            "Period Name",
            "Document Number",
            "BP Reference No.",
            "Created From",
            "Customer/Vendor Name",
            "Legacy ID",
            "CustomerID",
            "Ship-To Country",
            "Ship-To-City",
            "Sub-Region",
            "Segment_0",
            "AcctCode",
            "Quantity",
            "Unit Price",
            "TreeType",
            "Item",
            "Item Description",
            "Product Type",
            "Product Brand",
            "Product Category",
            "Product Sub-Category",
            "Net Price",
            "Gross Line Total",
            "Net Line Total",
            "Sales Rep Name",
            "Sales Rep 2 Name",
            "Sales Rep 3 Name",
            "2nd Unit",
            "Ship-To State",
            "Ship-To Zip Code",
            "U_V33_GlobalRegion",
            "Channel",
            "Sub-Channel",
            "GroupName",
            "U_V33_Comm_Prop",
            "Item Group",
            "Region",
            "Parent Customer",
            "Trade Type",
            "Trade In Type",
            "Average Cost",
            "Remarks",
            "Special Category",
            "Sales Area",
            "Warehouse",
            "Payment Terms",
            "Created By",
            "Internal ID",
            "Line Unique Key",
            "Line ID",
            "Line Sequence Number",
            "Product Hierarchy",
            "PO Line#"
        ];

        function getInputData() {
            let period = runtime.getCurrentScript().getParameter({ name: "custscript_period" });
            let startPeriod = runtime.getCurrentScript().getParameter({ name: "custscript_start_period" });
            //let filter3 = runtime.getCurrentScript().getParameter({ name: "custscript_file" });
          	if(period == null || startPeriod == null){
                var config = findFirstSalesRevenueReportConfig();
              	log.debug('config', config);
                period = config.startPeriod;
                startPeriod = config.startPeriod;
            }else{
              log.debug("period.trim() == '' || startPeriod.trim() == ''", period == null || startPeriod == null);
            }
          	
            log.debug('period', period);
            log.debug('startPeriod', startPeriod);
            var searchObject = search.load({
                type: 'transaction',
                id: 'customsearch_hf_sales_data_in_range_2__6'
            });
            var mySearchFilter = search.createFilter({
                name: 'postingperiod',
                operator: search.Operator.IS,
                values: [period]
            });
            searchObject.filters.push(mySearchFilter);
            log.debug('searchObject', searchObject);
            return searchObject;
        }

        function map(context) {
            try {
                let searchResult = JSON.parse(context.value);
                //log.error('custbody_hf_2nd_unit', searchResult.values["custbody_hf_2nd_unit"]);
                //log.error('searchResult.values["custbody_hf_2nd_unit"] == false', searchResult.values["custbody_hf_2nd_unit"] == false);
                if (searchResult.values["terms"].hasOwnProperty('text'))
                    searchResult.values["terms"] = searchResult.values["terms"].text;

                if (searchResult.values["terms"].trim() == '')
                    searchResult.values["terms"] = "Credit Card";

                if (searchResult.values["custentity_hf_class.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_class.customer"] = searchResult.values["custentity_hf_class.customer"].text;

                let region = searchResult.values["custentity_hf_class.customer"];
                searchResult.values["custentity_hf_class.customer"] = region.substring(region.lastIndexOf(':') + 1, region.length).trim();

                if (searchResult.values["createdfrom"].hasOwnProperty('text'))
                    searchResult.values["createdfrom"] = searchResult.values["createdfrom"].text;
                else
                    searchResult.values["createdfrom"] = "";

                if (searchResult.values["custbody_hf_2nd_unit"] == 'F') {
                    searchResult.values["custbody_hf_2nd_unit"] = "No";
                }
                else if (searchResult.values["custbody_hf_2nd_unit"] == 'T') {
                    searchResult.values["custbody_hf_2nd_unit"] = "Yes";
                }
                else {
                    searchResult.values["custbody_hf_2nd_unit"] = "'" + "'";
                }

                if (searchResult.values["createdby"].hasOwnProperty('text'))
                    searchResult.values["createdby"] = searchResult.values["createdby"].text;

                if (searchResult.values["shipcountry"].hasOwnProperty('text'))
                    searchResult.values["shipcountry"] = searchResult.values["shipcountry"].text;

                if (searchResult.values["custentity_hf_subregion.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_subregion.customer"] = searchResult.values["custentity_hf_subregion.customer"].text;

                if (searchResult.values["type.item"].hasOwnProperty('text'))
                    searchResult.values["type.item"] = searchResult.values["type.item"].text;

                if (searchResult.values["salesdescription.item"].trim() != '') {
                    searchResult.values["salesdescription.item"] = searchResult.values["salesdescription.item"].replaceAll(/"/g, '');
                    searchResult.values["salesdescription.item"] = searchResult.values["salesdescription.item"].replaceAll(/,/g, '|');
                    searchResult.values["salesdescription.item"] = searchResult.values["salesdescription.item"].toString();
                }

                if (searchResult.values["item"].hasOwnProperty('text'))
                    searchResult.values["item"] = searchResult.values["item"].text;

                if (searchResult.values["custitem_hf_hierarchy_lvl1.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_hierarchy_lvl1.item"] = searchResult.values["custitem_hf_hierarchy_lvl1.item"].text;

                if (searchResult.values["custitem_hf_hierarchy_lvl2.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_hierarchy_lvl2.item"] = searchResult.values["custitem_hf_hierarchy_lvl2.item"].text;

                if (searchResult.values["custitem_hf_hierarchy_lvl3.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_hierarchy_lvl3.item"] = searchResult.values["custitem_hf_hierarchy_lvl3.item"].text;

                if (searchResult.values["custitem_hf_hierarchy_lvl4.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_hierarchy_lvl4.item"] = searchResult.values["custitem_hf_hierarchy_lvl4.item"].text;

                //if (searchResult.values["periodname.accountingPeriod"])
                //searchResult.values["periodname.accountingPeriod"] = '"' + searchResult.values["periodname.accountingPeriod"] + '"';

                if (searchResult.values["salesrep"].hasOwnProperty('text'))
                    searchResult.values["salesrep"] = searchResult.values["salesrep"].text;

                if (searchResult.values["custbody_hf_sales_area"].hasOwnProperty('text'))
                    searchResult.values["custbody_hf_sales_area"] = searchResult.values["custbody_hf_sales_area"].text;

                if (searchResult.values["custentity_hf_globalregion.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_globalregion.customer"] = searchResult.values["custentity_hf_globalregion.customer"].text;

                if (searchResult.values["custentity_hf_channel.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_channel.customer"] = searchResult.values["custentity_hf_channel.customer"].text;

                if (searchResult.values["custentity_hf_subchannel.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_subchannel.customer"] = searchResult.values["custentity_hf_subchannel.customer"].text;

                if (searchResult.values["custentity_hf_salesgroup.customer"].hasOwnProperty('text'))
                    searchResult.values["custentity_hf_salesgroup.customer"] = searchResult.values["custentity_hf_salesgroup.customer"].text;

                if (searchResult.values["custitem_hf_commproperty.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_commproperty.item"] = searchResult.values["custitem_hf_commproperty.item"].text;

                if (searchResult.values["custitem_hf_itemgroup.item"].hasOwnProperty('text'))
                    searchResult.values["custitem_hf_itemgroup.item"] = searchResult.values["custitem_hf_itemgroup.item"].text;

                if (searchResult.values["parent.customer"].hasOwnProperty('text'))
                    searchResult.values["parent.customer"] = searchResult.values["parent.customer"].text;

                if (searchResult.values["locationnohierarchy"].hasOwnProperty('text'))
                    searchResult.values["locationnohierarchy"] = searchResult.values["locationnohierarchy"].text;

                if (searchResult.values["internalid"].hasOwnProperty('text'))
                    searchResult.values["internalid"] = searchResult.values["internalid"].text;
                //log.error('searchResult.values', searchResult.values);
                context.write({
                    key: searchResult.id,
                    value: searchResult.values
                });

            } catch (ex) {
                log.error('exception in map', ex);
            }
        }

        function reduce(context) {
            try {
                let searchResult = context.values;
                let key = context.key;
                let Lines = [];
                for (let i = 0; i < searchResult.length; i++) {
                    var data = JSON.parse(searchResult[i]);
                    Lines.push(data);
                }
                var negativeLine = Lines.filter(function (el) {
                    return (Number(el.amount) < 0 && (el.item).trim() == '');
                });
                var possitiveLine = Lines.filter(function (el) {
                    return (Number(el.amount) >= 0 || (el.item).trim() != '');
                });
                let linesToSkip = [];
                for (let i = 0; i < negativeLine.length; i++) {
                    let negativeCurrency = Number(negativeLine[i].amount);
                    let negativeCurrencyToCompare = negativeCurrency * -1;
                    let NotMatched = true;
                    for (let j = 0; j < possitiveLine.length; j++) {
                        if (linesToSkip.indexOf(j) >= 0) {
                            continue;
                        }
                        var possitiveCurrency = Number(possitiveLine[j].amount);
                        if (negativeCurrencyToCompare == possitiveCurrency) {
                            possitiveLine[j].amount = possitiveCurrency + negativeCurrency;
                            possitiveLine[j].netamount = Number(possitiveLine[j].netamount) + Number(negativeLine[i].netamount);
                            linesToSkip.push(j);
                            NotMatched = false;
                            break;
                        }
                    }
                    if (NotMatched) {
                        possitiveLine.push(negativeLine[i]);
                    }
                }
                if (possitiveLine.length > 0) {
                    let objectFields = Object.keys(possitiveLine[0]);
                    //log.error('objectFields', objectFields);
                    var dataLines = '';
                    for (let j = 0; j < possitiveLine.length; j++) {
                        let objectLine = possitiveLine[j];
                        for (let k = 0; k < objectFields.length; k++) {
                            if (objectLine[objectFields[k]].toString().indexOf(',') > 0) {
                                dataLines = dataLines + '"' + objectLine[objectFields[k]].toString() + '"' + ',';
                            } else {
                                //dataLines = dataLines +  objectLine[objectFields[k]] + ',';
                                dataLines = dataLines + '"' + objectLine[objectFields[k]].toString() + '"' + ',';
                            }
                            //log.error(objectFields[k], objectLine[objectFields[k]].toString());
                        }

                        if (possitiveLine.length != (j + 1))
                            dataLines = dataLines + '\n';
                    }
                    context.write(key, dataLines);
                }
            } catch (ex) {
                log.error('exception in reduce', ex);
            }
        }

        function summarize(context) {
            let period = runtime.getCurrentScript().getParameter({ name: "custscript_period" });
            let StartPeriod = runtime.getCurrentScript().getParameter({ name: "custscript_start_period" });
            let endPeriod = runtime.getCurrentScript().getParameter({ name: "custscript_end_period" });
            let folderDetail = runtime.getCurrentScript().getParameter({ name: "custscript_hf_report_folder_id" });

            if(period == null || StartPeriod == null){
                var config = findFirstSalesRevenueReportConfig();

                if(config.startPeriod == null){
                    log.debug('Cancel Execution as there is no period or start period (config)', config);
                    return;
                }
                period = config.startPeriod;
                StartPeriod = config.startPeriod;
                endPeriod = config.endPreriod;
            }

          	log.debug('period summarize', period);
            log.debug('StartPeriod summarize', StartPeriod);
			let folderId = 2332419;
            if (period == StartPeriod) {
                var fieldsForCsv = coulmnsForCsv.toString();

                var fileLines = fieldsForCsv + '\n';
                //SB2 1917196; //runtime.getCurrentScript().getParameter({ name: 'custscript_hf_report_folder_id' });
                //SB1 2192107
                var fileObj = file.create({
                    //To make each file unique and avoid overwriting, append date on the title
                    name: 'IS Sales Revenue Report -' + getTimeStamp() + '.csv',
                    fileType: file.Type.CSV,
                    contents: fileLines,
                    description: 'IS Sales Revenue Report',
                    encoding: file.Encoding.UTF8,
                    folder: folderId
                });

                context.output.iterator().each(function (key, value) {
                    fileLines += value;
                    fileObj.appendLine({
                        value: value
                    });
                    return true;
                });

                fileObj.save();
              	//If total files in file cabinet is more than 10 then delete older files 
                deleteReport(folderId);
            } else {
                var fileObj = getFileCreatedToday(folderId);

                if (fileObj != '') {
                    context.output.iterator().each(function (key, value) {
                        fileLines += value;
                        fileObj.appendLine({
                            value: value
                        });
                        return true;
                    });

                    fileObj.save();
                }
            }

            var listDetail = record.create({
                type: 'customrecord_hf_is_sales_revenue_report',
                isDynamic: true
            });
            var periodList = listDetail.getField({
                fieldId: 'custrecord_start_period'
            });
            var currentPeriod = listDetail.getValue({
                fieldId: 'custrecord_start_period'
            });
            var periodList = periodList.getSelectOptions();

            var periodArray = [];
            periodList.forEach(function (period) {
                periodArray.push(period.value);
            });
            log.debug('periodArray summarize', periodArray);
            log.debug('periodArray.indexOf(period) summarize', periodArray.indexOf(period));
            log.debug('periodArray.indexOf(currentPeriod) summarize', periodArray.indexOf(currentPeriod));
          	let sendEmail = true;
            if (periodArray.indexOf(period) >= 0 && periodArray.indexOf(currentPeriod) > periodArray.indexOf(period)) {
                var nextPeriod = periodArray[periodArray.indexOf(period) + 1];
                log.debug('nextPeriod summarize', nextPeriod);
                if (nextPeriod && nextPeriod <= endPeriod) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: "customscript_hf_sales_revenue_report",
                        deploymentId: "customdeploy_hf_sales_revenue_report",
                        params: { "custscript_Period": nextPeriod, "custscript_start_period": StartPeriod, "custscript_end_period": endPeriod }
                    });
                    var mrTaskId = mrTask.submit();
                  	sendEmail = false;
                }
            }
          	if(sendEmail){
                var fileObj = getFileCreatedToday(folderId);

                if (fileObj != '') {
                    sendEmailOnCompletion(fileObj.url);
                }
            }

        }

        //returns a unique time stamp that will be appended to file name generated
        function getTimeStamp() {
            let currentDate = new Date();
            let currentday = currentDate.getDate().toString();
            let dayLen = currentday.length;
            if (dayLen == 1) {
                currentday = '0' + currentday;
            }
            let currentmonth = (currentDate.getMonth() + 1).toString();
            let len = currentmonth.length;
            if (len == 1) {
                currentmonth = '0' + currentmonth;
            }
            let currentyear = currentDate.getFullYear().toString();
            return currentday + '_' + currentmonth + '_' + currentyear;
        }

        function getFileCreatedToday(folderId) {
            var fileSearchObj = search.create({
                type: "file",
                filters:
                    [
                        ["folder", "anyof", folderId],
                        "AND",
                        ["filetype", "anyof", "CSV"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({
                            name: "created",
                            sort: search.Sort.DESC,
                            label: "Date Created"
                        })
                    ]
            });
            var recordId;
            var resultset = fileSearchObj.run();
            var results = resultset.getRange(0, 1);
            for (var i in results) {
                var result = results[i];
                recordId = result.getValue('internalid');
            }

            if (recordId) {
                var fileObj = file.load({
                    id: recordId
                });

                return fileObj;
            } else {
                return '';
            }
        }

        function deleteReport(folderId) {
            var fileSearchObj = search.create({
                type: "file",
                filters:
                    [
                        ["folder", "anyof", folderId],
                        "AND",
                        ["filetype", "anyof", "CSV"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "name", label: "Name" }),
                        search.createColumn({
                            name: "created",
                            sort: search.Sort.ASC,
                            label: "Date Created"
                        }),
                        search.createColumn({
                            name: "internalid",
                            label: "internalid"
                        })
                    ]
            });
            var searchResultCount = fileSearchObj.runPaged().count;

            if (searchResultCount > 10) {
                var range = searchResultCount - 10;
                var resultset = fileSearchObj.run();
                var results = resultset.getRange(0, range);
                for (var i in results) {
                    var result = results[i];
                    try {
                        var fileId = result.getValue('internalid');
                        file.delete({
                            id: fileId
                        });
                    } catch (error) {
                        log.error('Error while deleting ' + result.getValue('internalid') + error.name, error);
                    }
                }
            }
        }

  		function findFirstSalesRevenueReportConfig() {
            var customrecord_hf_is_sales_revenue_reportSearchObj = search.create({
                type: "customrecord_hf_is_sales_revenue_report",
                filters:
                    [
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_start_period",
                            sort: search.Sort.ASC,
                            label: "Start Period"
                        }),
                        search.createColumn({ name: "custrecord_end_period", label: "End Period" }),
                      	search.createColumn({name: "lastmodifiedby", label: "Last Modified By"})
                    ]
            });
            var reportCriteria = {
                "startPeriod":'',
                "endPreriod":'',
              	"lastModifiedBy": ''
            };
            var resultset = customrecord_hf_is_sales_revenue_reportSearchObj.run();
            var results = resultset.getRange(0, 1);
            for (var i in results) {
                var result = results[i];
                try {
                    reportCriteria.startPeriod = result.getValue('custrecord_start_period');
                    reportCriteria.endPreriod = result.getValue('custrecord_end_period');
                  	reportCriteria.lastModifiedBy = result.getValue('lastmodifiedby');
                } catch (error) {}
            }
            return reportCriteria;
        }

        function sendEmailOnCompletion(url){
            var config = findFirstSalesRevenueReportConfig();
          	var employee =  record.load({
                type: 'employee',
                id: config.lastModifiedBy
            });
            let emailAddress = employee.getValue('email');

            if(emailAddress)
              try {
                  email.send({
                      author: config.lastModifiedBy,
                      recipients: [emailAddress],
                      subject: 'IS Sales Revenue Report',
                      body: 'Hello,</br></br>The IS Sales Revenue Report you have submitted for execution is generated successfully. You can view the file by clicking on the link below.</br></br><a href="'+ url +'">IS Sales Revenue Report</a>'
                  });
              } catch (e) {
                  log.debug('error', e.message);
              }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });

