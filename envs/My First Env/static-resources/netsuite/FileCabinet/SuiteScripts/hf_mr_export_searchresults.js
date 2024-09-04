/*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-5369
Script Name   : hf_mr_export_searchresults.js
Date          : 11/25/2022
Author        : Pavan Kaleru
Description   : Saved Search report template to export the results (.csv) to the file cabinet
*************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/task', 'N/file','N/runtime'], function(search, task,file,runtime) {
    function getInputData() {
		var savedSearchId = runtime.getCurrentScript().getParameter('custscript_hf_search_to_export');
      	log.debug('savedSearchId' , savedSearchId)

        var searchObj = search.load({
          id : savedSearchId
        });
      var runSearch = searchObj.run().getRange({
            start: 0,
            end: 1
        });
      return runSearch
    }
    function map(context) {
      	try {
          	log.debug('map is strting')
			
				
        } catch (e) {
            log.debug('e2', e);
        }
    }

  
    function summarize(context) {
        log.audit({
            title: 'Usage units consumed',
            details: context.usage
        });
        log.audit({
            title: 'Concurrency',
            details: context.concurrency
        });
        log.audit({
            title: 'Number of yields',
            details: context.yields
        });
      		var savedSearchToExport = runtime.getCurrentScript().getParameter('custscript_hf_search_to_export');
      		var searchName = getSavedSearchName(savedSearchToExport)
      		var timeStamp = getTimeStamp()
          	var folderId = runtime.getCurrentScript().getParameter('custscript_hf_folder_to_store')
			// Create the search task
			var myTask = task.create({
				taskType: task.TaskType.SEARCH
			})
			myTask.savedSearchId = savedSearchToExport;

			// Specify the ID of the file that search results will be exported into
			//
			// Update the following statement so it uses the internal ID of the file
			// you want to use
				var fileObj = file.create({
				name: searchName + ' ' + timeStamp+'.csv' ,
				fileType: file.Type.CSV,
				contents: 'Hello World\nHello World',
				description: 'Saved Search report generated through script',
				folder: folderId,
				isOnline: true
			});
			var fileId = fileObj.save();
			log.debug('fileId' , fileId);
			myTask.fileId = fileId;

			// Submit the search task
			var myTaskId = myTask.submit();

			// Retrieve the status of the search task
			var taskStatus = task.checkStatus({
				taskId: myTaskId
			});
    }
  
  	function getSavedSearchName(savedSearchToExport){
      var savedsearchSearchObj = search.create({
   type: "savedsearch",
   filters:
   [
      ["internalidnumber","equalto",savedSearchToExport]
   ],
   columns:
   [
      search.createColumn({name: "frombundle", label: "From Bundle"}),
      search.createColumn({name: "title", label: "Title"}),
      search.createColumn({name: "id", label: "ID"}),
      search.createColumn({name: "recordtype", label: "Type"}),
      search.createColumn({name: "owner", label: "Owner"}),
      search.createColumn({name: "access", label: "Access"}),
      search.createColumn({name: "exportcsv", label: "Export Results"}),
      search.createColumn({name: "persistcsv", label: "Persist Results"}),
      search.createColumn({name: "lastrunby", label: "Last Run By"}),
      search.createColumn({name: "lastrunon", label: "Last Run On"})
   ]
});
var searchResultCount = savedsearchSearchObj.runPaged().count;
var searchTitle = ''
log.debug("savedsearchSearchObj result count",searchResultCount);
savedsearchSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
  	searchTitle = result.getValue('title')
  log.debug('searchTitle' , searchTitle)
   return false;
});
      return searchTitle;

    }
  //returns a unique time stamp that will be appended to file name generated
        function getTimeStamp() {
            var currentDate = new Date();
            var currentday = currentDate.getDate().toString();
            var dayLen = currentday.length;
            if (dayLen == 1) {
                currentday = '0' + currentday;
            }
            var currentmonth = (currentDate.getMonth() + 1).toString();
            var len = currentmonth.length;
            if (len == 1) {
                currentmonth = '0' + currentmonth;
            }
            var currentyear = currentDate.getFullYear().toString();
            var hours = currentDate.getHours().toString();
            var minutes = currentDate.getMinutes().toString();
            var seconds = currentDate.getSeconds().toString();


            return currentday + '_' + currentmonth + '_' + currentyear + '_' + hours + minutes + seconds;
        }

    // Link each entry point to the appropriate function.
    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});