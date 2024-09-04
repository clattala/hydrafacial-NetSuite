/**
 * @NApiVersion 2.1
 * @NModuleScope TargetAccount
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search'], function (log, runtime, record, search) {
  'use strict';

  return {
    post: function (request) {
      var body = JSON.parse(request.body || '{}');
      if (body.action && body.action.length > 0) {
        if (body.action === 'confirmTerms') {
          return this.confirmTerms(body);
        }
      }

      return {
        type: 'error',
        message: 'Action not defined'
      }
    },

    confirmTerms: function (requestBodyJSON) {
      var user = runtime.getCurrentUser();
      var actualDate = new Date();
      var values = {
        custentity_hf_loyalty_agree_terms: true,
        custentity_hf_loyalty_optin: true
      }
      var customerLookup = search.lookupFields({ type: search.Type.CUSTOMER, id: user.id, columns: ['entityid', 'custentity_hf_current_loyalty_tier', 'custentity_hf_loyalty_opt_in_date']});
      if(customerLookup && customerLookup['entityid']) {
        values['custentity_hf_loyalty_id'] = customerLookup['entityid'];
      }

      log.error('custentity_hf_current_loyalty_tier', customerLookup['custentity_hf_current_loyalty_tier'])
      if(customerLookup['custentity_hf_current_loyalty_tier'] && customerLookup['custentity_hf_current_loyalty_tier'].length < 1 ) values['custentity_hf_current_loyalty_tier'] = 1;
      if(customerLookup['custentity_hf_loyalty_opt_in_date'] && customerLookup['custentity_hf_loyalty_opt_in_date'].length < 1 ) values['custentity_hf_loyalty_opt_in_date'] = actualDate;
      // set opt in to loyalty field to true, agree terms field to true
      record.submitFields({
          type: record.Type.CUSTOMER,
          id: user.id,
          values: values
        }
      );
      return {
        success: true,
        message: 'Terms updated.'
      }
    }
  }
})

