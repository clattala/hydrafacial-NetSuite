/*************************************************************
Fresh Service ID: 
Script Name     : 
Date            : 03/6/2024
Author          : Ayush Gehalot
UpdatedBy       : 
Description     : 
***************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/email', 'N/render'], function (search, record, email, render) {

    function getInputData() {
        let lastDayOfTheMonth = getLastDayOfMonth();
        let today = getCurrentDay();
        //log.debug('today - ' + today);
        //log.debug('lastDayOfTheMonth - ' + lastDayOfTheMonth);
        //if(lastDayOfTheMonth == today){
            return search.load({
                type: record.Type.JOURNAL_ENTRY,
                id: 'customsearch_recurring_journals'
            });
        //} else {
        //    log.debug('Not lastDayOfTheMonth - ' + lastDayOfTheMonth);
        //    return {};
        //}
    }

    function map(context) {
        try {
            let searchResult = JSON.parse(context.value);

            context.write({
                key: searchResult.id,
                value: searchResult.values
            });

        } catch (ex) {
            log.error('exception in map', ex);
        }
    }

    function getLastDayOfMonth() {
        const now = new Date(); // Get current date
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Set to first day of next month, then go back one day (which is the last day of the current month)
        return nextMonth.getDate(); // Get the day (which is the last day of the current month)
    }

    function getCurrentDay() {
        const now = new Date(); // Get current date
        return now.getDate(); // Get the current day of the month
    }

    function reduce(context) {
        log.debug('reduce start - ' + context.key);
        let key = context.key;
        let journalentrySearchObj = search.create({
            type: "journalentry",
            settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
            filters:
            [
               ["type","anyof","Journal"], 
               "AND", 
               ["custbody_hf_parent_journal","anyof",key], 
               "AND", 
               ["status","noneof","Journal:V"], 
               "AND", 
               ["linesequencenumber","equalto","0"], 
               "AND", 
               ["datecreated","on","today"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });
        let searchResultCount = journalentrySearchObj.runPaged().count;
        if(searchResultCount > 0){
            //log.debug('reduce searchResultCount - ' + searchResultCount);
            //return;
        }

        var journalentrySearchObj2 = search.create({
   type: "journalentry",
   settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["status","noneof","Journal:V"], 
      "AND", 
      ["linesequencenumber","equalto","0"], 
      "AND", 
      [["custbody_hf_parent_journal","anyof",key],"OR",["internalid","anyof",key]]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"}),
      search.createColumn({name: "postingperiod", label: "Period"})
   ]
});
var recordId, postingperiod;
searchResultCount = journalentrySearchObj2.runPaged().count;
log.debug("journalentrySearchObj2 result count",searchResultCount);
journalentrySearchObj2.run().each(function(result){
  log.debug("result",result);
  result
    if(!postingPeriod){
        postingPeriod = result.getValue('postingperiod');
       recordId = result.getValue('internalid');
     }else if (Number(postingPeriod) < Number(result.getValue('postingperiod'))){
        postingPeriod = result.getValue('postingperiod');
       recordId = result.getValue('internalid');
     }
   return true;
});
        log.debug('postingperiod' + postingperiod);
      
        let searchResult = context.values;

        let remainingJE = 1;
        let transactionId = '';
        for (let i = 0; i < searchResult.length; i++) {
            let data = JSON.parse(searchResult[i]);
            remainingJE = data['custbody_hf_je_number_remaining'];
            transactionId = data['tranid'];
            break;
        }
        //log.debug('remainingJE' + remainingJE);
        try {
            let JECopy = record.copy({
                type: record.Type.JOURNAL_ENTRY,
                id: key,
                isDynamic: true
            });
            //JECopy.setValue('custbody_hf_je_indefinite', false);
            JECopy.setValue('custbody_hf_je_number_remaining', 0);
            JECopy.setValue('custbody_total_je_recurring', 0);
            JECopy.setValue('custbody_hf_parent_journal', key);
            var periodList = JECopy.getField({
   fieldId: 'postingperiod'
});
var periodList = periodList.getSelectOptions();
var nextPeriod = '';
for (var i = 0; i < periodList.length; i++) {
   var optionValue = periodList[i].value;
   var optionText = periodList[i].text;
   if(postingperiod == optionValue || postingperiod == optionText) {
      if(i < periodList.length-1 ) {
         nextPeriod = periodList[i+1].value;
      } else {
         nextPeriod = periodList[i].value;
      }
      break;
   }
}
          log.debug('nextPeriod' + nextPeriod);
         
          JECopy.setValue('postingperiod', nextPeriod);
          return;
            let NewJE = JECopy.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });
            log.debug('reduce NewJE - ' + NewJE);
            record.submitFields({
                "type": record.Type.JOURNAL_ENTRY,
                "id": key,
                "values": {
                    "custbody_hf_je_number_remaining": remainingJE - 1,
                    "custbody_hf_recurring_je_failu_comment": ""
                }
            });
            log.debug('reduce submitFields - ' + remainingJE);
        } catch (ex) {
            log.error('exception in reduce ' + key, ex);
            context.write({
                key: transactionId,
                value: ex.name + " - " + ex.message
            });
            try {
                record.submitFields({
                    "type": record.Type.JOURNAL_ENTRY,
                    "id": key,
                    "values": {
                        "custbody_hf_recurring_je_failu_comment": ex.name + " - " + ex.message
                    }
                });
            } catch (e) {
                log.error('exception in reduce ' + key, e.message);
            }
        }
    }

    function summarize(context) {
        // var failedJE = "Journal ID   |  Values <br/>";
        // context.output.iterator().each(function (key, value) {
        //     failedJE += key + "  |  " + value  + " <br/>";
        //     return true;
        // });

        // log.debug('exception - ' + failedJE);
        var failedJE = '<html><body><span>Hello,</span><br/><br/><span>Please check the details of the failed journal below.</span><br/><br/><table border="1"><tr><th>Journal ID</th><th>Error</th></tr>';
        context.output.iterator().each(function (key, value) {
            failedJE += '<tr><td>' + key + '</td><td>' + value + '</td></tr>';;
            return true;
        });

        failedJE += '</table><br/><span>Thanks.</span></body></html>';

        email.send({
            author: "188682",
            recipients: 'test@gmail.com',
            subject: "Failed recurring Journals",
            body: failedJE
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
