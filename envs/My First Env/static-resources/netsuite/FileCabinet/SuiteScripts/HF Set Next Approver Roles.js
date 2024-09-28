/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define([
  'N/record',
  'N/search',
  'N/runtime'
], function(record, search, runtime) {
  function onAction(scriptContext) {
    log.debug({
      title: 'Start Script'
    });
    var currentUserRole = runtime.getCurrentScript().getParameter('custscript_hf_user_role');
	var currentUserRole1 = runtime.getCurrentUser().role;
    var currentLevel = runtime.getCurrentScript().getParameter('custscript_hf_current_level');
    var currentUser = runtime.getCurrentScript().getParameter('custscript_hf_current_user');
    var currentLevelRole = runtime.getCurrentScript().getParameter('custscript_hf_current_level_role');
    log.debug('currentUserRole',currentUserRole);
	log.debug('currentUserRole1',currentUserRole1);
    log.debug('currentLevel', currentLevel);
    var newRecord = scriptContext.newRecord;
    var type = newRecord.type;
    var vbSubsidiary = newRecord.getValue('subsidiary');

    var nextApproverLevel = returnApproverLevel(currentUserRole1, currentLevel, vbSubsidiary, currentLevelRole);

    log.debug('nextApproverLevel', nextApproverLevel);

    return nextApproverLevel ? nextApproverLevel : currentLevel;
  }

  function returnApproverLevel(userRole, currentLevel, vbSubsidiary, currentLevelRole) {
    var lineNum = 0;
    var customrecord_hf_vb_approver_limit_roleSearchObj = search.create({
      type: 'customrecord_hf_vb_approver_limit_role',
      filters: [
        [
          'custrecord_hf_vb_subsidiary',
          'anyof',
          vbSubsidiary
        ]
      ],
      columns: [
        search.createColumn({
          name: 'custrecord_hf_approver_level',
          label: 'Level',
          sort: search.Sort.ASC
        }),
        search.createColumn({
          name: 'custrecord_hf_approver_limit',
          label: 'Approver Limit'
        }),
        search.createColumn({
          name: 'custrecord_hf_approver_role',
          label: 'Approver Role'
        }),
        search.createColumn({
          name: 'custrecord_hf_vb_subsidiary',
          label: 'Subsidiary'
        })
      ]
    });
    var flag = 0;

	
    var searchresult = customrecord_hf_vb_approver_limit_roleSearchObj.run().getRange(0, 10);
   
    for (var i = 0; i < searchresult.length; i++) {
      var recLevel = searchresult[i].getValue({ name: 'custrecord_hf_approver_level' });
      var recRole = searchresult[i].getValue({ name: 'custrecord_hf_approver_role' });
      var recLimit = searchresult[i].getValue({ name: 'custrecord_hf_approver_limit' });
      log.debug('recRole',recRole);
      
      if ((currentLevel == null) || (currentLevel != null  && userRole == 3 && Number(currentLevel) < Number(recLevel)) || flag == 1) {
      
        return searchresult[i].id;
      }
      if (userRole == recRole) {
        flag = 1;
		log.debug('Flag true','Flag true');
      }
    }

    return '';
  }

  return {
    onAction: onAction
  };
});
