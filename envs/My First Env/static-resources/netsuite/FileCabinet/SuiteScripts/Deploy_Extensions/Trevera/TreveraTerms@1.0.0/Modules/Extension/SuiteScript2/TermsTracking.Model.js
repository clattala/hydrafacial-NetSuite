/**
 * @NApiVersion 2.1
 * @NModuleScope TargetAccount
 */
define(['N/log', 'N/runtime', 'N/record'], function (log, runtime, record) {
  'use strict';

  return {
    post: function (request) {
      var body = JSON.parse(request.body || '{}');
      if (body.action && body.action.length > 0) {
        if (body.action === 'confirmTerms') return this.confirmTerms(body);
      }

      return {
        type   : 'error',
        message: 'Action not defined'
      }
    },

    confirmTerms: function (requestBodyJSON) {
      var user = runtime.getCurrentUser();
      record.submitFields({type: record.Type.CUSTOMER, id: user.id, values: {custentity_hf_loyalty_agree_terms: true}});
      return {
        success: true,
        message: 'Terms updated.'
      }
    }
  }
})
