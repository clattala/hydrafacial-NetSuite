/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/transaction', 'N/search', 'N/file', 'N/runtime' , 'N/email'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (transaction, search, file, runtime, email) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                var scriptObj = runtime.getCurrentScript();
              	var currentUser = runtime.getCurrentUser()
				log.debug('currentUser' , currentUser)
                var voidFileId = scriptObj.getParameter({
                    name: 'custscript_hf_void_file'
                });
              	var informUser = scriptObj.getParameter({
                    name: 'custscript_hf_inform_user'
                });
              var emailSender = scriptObj.getParameter({
                    name: 'custscript_hf_email_sender'
                });
                if (voidFileId) {
                    var fileObj = file.load({
                        id: voidFileId
                    });
                    var arr_WorkorderNumbers = []
                    var filteredIDs = [];

                    fileObj.lines.iterator().each(function(line) {
                        // log.debug('line', line)
                        var lineData = line.value.split(",");
                        //  log.debug('w', w)
                        arr_WorkorderNumbers.push(lineData[0])

                        return true;
                    });
                    log.debug('arr_WorkorderNumbers', arr_WorkorderNumbers)

                    for (var i = 0; i < arr_WorkorderNumbers.length; i++) {
                        filteredIDs.push(['tranid', 'is', arr_WorkorderNumbers[i]])
                        filteredIDs.push('OR');
                    }
                    filteredIDs.pop();
                                      log.debug('filteredIDs', filteredIDs)

                  	filteredIDs = [filteredIDs]
                                                        log.debug('afterf', filteredIDs)

                    var arr_WorkOrders = searchOrders(filteredIDs)
                    log.debug('arr_WorkOrders after function ', arr_WorkOrders)
                    var arr_WorkOrdersNotProcessed = [];
                    var count = 0
                    if (arr_WorkOrders.length > 0) {
                        var noOfWorkOrders = arr_WorkOrders.length;
                        for (var workOrder = 0; workOrder < noOfWorkOrders; workOrder++) {
                            var workOrderInternalId = arr_WorkOrders[workOrder].getValue({
                        name: "internalid",
                        summary: "GROUP",
                    })
                            try {
                                var obj_workOrderRecord = transaction.void({
                                    type: 'workorder',
                                    id: workOrderInternalId
                                });
                                log.debug('obj_workOrderRecord', obj_workOrderRecord)
                                if (obj_workOrderRecord) {
                                    count++
                                }
                            } catch (error) {

                                log.error('error while voidin the transaction  ' + workOrderInternalId + error.message, error)
                              var tranId =   arr_WorkOrders[workOrder].getValue({
                        name: "tranid",
                        summary: "GROUP",
                    })
                                arr_WorkOrdersNotProcessed.push(tranId)
                            }

                        }
                      var message = 'The WorkOrders processed are ' + count + '/' + arr_WorkorderNumbers.length + ' The workorders not processed are ' + arr_WorkOrdersNotProcessed

						log.debug('message' , message);
                        log.error('arr_WorkOrdersNotProcessed', arr_WorkOrdersNotProcessed)
                    }

                  if(arr_WorkOrders.length==0){
                    message = 'The workorders specified in the file are not found , Please correct the file and reprocess'
                  }
                  if(informUser && emailSender){
                   try {
                  email.send({
                      author: emailSender,
                      recipients:informUser ,
                      subject: 'Void WorkOrders Status',
                      body: 'Hello,</br></br>The Plan Work Orders you submitted to void were completed , the details are : \n ' + message 
                  });
              } catch (e) {
                  log.debug('error', e.message);
              }
                  }
                }else{
                  log.error('File Id is not present  , please fill the FileID which has the Workorders which needs to be processed')
                }


            } catch (error) {
                log.error('Error in main Function ' + error.message, error)
            }

        }


        function searchOrders(filters) {
            var workorderSearchObj = search.create({
                type: "workorder",
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                  search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "TRANID"
                    }),

                ]
            });
            var workOrderSearch = workorderSearchObj.run().getRange({
            start: 0,
            end: 1000
        });


/*workorderSearchObj.id="customsearch1678366638";
workorderSearchObj.title="Workordersearch";
var newSearchId = workorderSearchObj.save();
          log.debug('newSearchId',newSearchId)*/
log.debug('workOrderSearch', workOrderSearch)
		return workOrderSearch;

        }
        return {
            execute
        }

    });