function afterSubmit(type) {
    var APPROVED_STATUS = 2;
    var TYPE_SUPPORTED = ['create', 'copy', 'edit', 'xedit'];

    if (TYPE_SUPPORTED.indexOf(type.toLowerCase()) > -1) {
       var oldApprovalStatus = '';
       if (type === 'edit' || type === 'xedit') {
          var oldRecord = nlapiGetOldRecord();
          oldApprovalStatus = oldRecord.getFieldValue('approvalstatus') || '';
       }

       var newRecord = nlapiGetNewRecord();
       var newApprovalStatus = newRecord.getFieldValue('approvalstatus') || '';
	   var stSubsidiary = newRecord.getFieldValue('subsidiary');
       nlapiLogExecution('debug', 'stSubsidiary', stSubsidiary);

       if(stSubsidiary != '11'){
          nlapiLogExecution('debug', 'stSubsidiary', stSubsidiary);
          return;
       }
       if (
          oldApprovalStatus !== newApprovalStatus &&
          +newApprovalStatus === APPROVED_STATUS
       ) {
          setPostingPeriod();
       }
    }
 }

 function setPostingPeriod() {
    try {
       nlapiLogExecution('debug', 'Set Posting Period', 'START');
       var stType = nlapiGetRecordType();
       stType = stType.toUpperCase();

       if (stType === 'VENDORBILL') {
          var stpostPeriod = nlapiGetFieldValue('postingperiod');
          var stSubsidiary = nlapiGetFieldValue('subsidiary');
          var stRecordId = nlapiGetRecordId();

          if (!stpostPeriod) {
             var objRec = nlapiLoadRecord(stType, stRecordId);
             stpostPeriod = objRec.getFieldValue('postingperiod');
             stSubsidiary = objRec.getFieldValue('subsidiary');
          }

          var objResults = nlapiSearchRecord(
             'accountingperiod',
             null,
             [
                new nlobjSearchFilter(
                   'internalidnumber',
                   null,
                   'greaterthanorequalto',
                   stpostPeriod
                ),
                new nlobjSearchFilter('aplocked', null, 'is', 'F'),
                new nlobjSearchFilter('isquarter', null, 'is', 'F')
             ],
             new nlobjSearchColumn('internalid').setSort()
          );
          for (var i = 0; i < objResults.length; i++) {
             var stPeriod = objResults[i].getId();
             var arrFilters = [];
             arrFilters.push(
                new nlobjSearchFilter('itemtype', null, 'anyof', [
                   'PCP_LOCK_AP'
                ])
             );
             arrFilters.push(
                new nlobjSearchFilter('period', null, 'abs', stPeriod)
             );
             if (stSubsidiary)
                arrFilters.push(
                   new nlobjSearchFilter('subsidiary', null, 'anyof', [
                      stSubsidiary
                   ])
                );

             var objSearchPeriod = nlapiSearchRecord(
                'taskitemstatus',
                null,
                arrFilters,
                new nlobjSearchColumn('complete')
             );
             var bResultFound = false;
             if (objSearchPeriod) {
                if (objSearchPeriod.length > 0) {
                   var bComplete = objSearchPeriod[0].getValue('complete');
                   nlapiLogExecution(
                      'error',
                      'Set Posting Period',
                      'bComplete: ' + bComplete
                   );
                   if (bComplete !== 'T') {
                      nlapiLogExecution(
                         'debug',
                         'Set Posting Period',
                         'bComplete!==T > stPeriod: ' + stPeriod
                      );
                      setTransactionDate(stPeriod, stType, stRecordId);
                      break;
                   }
                   bResultFound = true;
                }
             }
             if (!bResultFound) {
                nlapiLogExecution(
                   'debug',
                   'Set Posting Period',
                   '!bResultFound > stPeriod: ' + stPeriod
                );
                setTransactionDate(stPeriod, stType, stRecordId);
                break;
             }
          }
       }
       nlapiLogExecution('debug', 'Set Posting Period', 'FINISH');
    } catch (error) {
       nlapiLogExecution('error', 'Set Posting Period', error.toString());
    }
 }

 function setTransactionDateOld(stPeriod, stType, stRecordId) {
    var objAcctgPeriod = nlapiLoadRecord('accountingperiod', stPeriod);
    var stPeriodStartDate = objAcctgPeriod.getFieldValue('startdate');
    var stDueDate = nlapiGetFieldValue('duedate');
    nlapiSubmitField(stType, stRecordId, ['trandate', 'duedate'], [stPeriodStartDate, stDueDate]);
 }

 function setTransactionDate(stPeriod, stType, stRecordId) {
     // var objAcctgPeriod = nlapiLoadRecord('accountingperiod', stPeriod);
     var stDueDate = nlapiGetFieldValue('duedate');
     var stTranDate = nlapiGetFieldValue('trandate');
   	 nlapiLogExecution('debug', 'Set Posting Period stDueDate', stDueDate);
   	 nlapiLogExecution('debug', 'Set Posting Period stTranDate', stTranDate);
   	 nlapiLogExecution('debug', 'Set Posting Period stPeriod', stPeriod);
     nlapiSubmitField(stType, stRecordId, ['trandate', 'duedate', 'postingperiod'], [stTranDate, stDueDate, stPeriod]);
 }