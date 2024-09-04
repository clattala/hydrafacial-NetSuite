/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search'], function (log, record, runtime, search) {
  'use strict';

  var _fieldsToLoad = ['custentity_hf_loyalty_agree_terms']

  return {
    get: function (request) {
      var user      = runtime.getCurrentUser();
      var isContact = user.contact > 0;
      var returnObj = {
        agreeTerms: false
      }

      var lookup           = search.lookupFields({type: search.Type.CUSTOMER, id: user.id, columns: _fieldsToLoad});
      returnObj.agreeTerms = lookup['custentity_hf_loyalty_agree_terms'];
      returnObj.isLoggedIn = true;

      return returnObj;
    }
  };
})
