/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/query'], function (runtime, query) {
  'use strict';

  //var _fieldsToLoad = ['custentity_hf_loyalty_agree_terms']

  return {
    get: function (request) {
      var user      = runtime.getCurrentUser();
      var isContact = user.contact > 0;
      var returnObj = {
        subsidiary: user.subsidiary,
        isLoggedIn: true
      }

      var domain = this.getSubsidiaryToDomainMapping(user.subsidiary);
      if(domain.length == 1) returnObj.domain = domain[0];

      //var lookup           = search.lookupFields({type: search.Type.CUSTOMER, id: user.id, columns: _fieldsToLoad});
      //returnObj.agreeTerms = lookup['custentity_hf_loyalty_agree_terms'];

      return returnObj;
    },

    getSubsidiaryToDomainMapping: function getSubsidiaryToDomainMapping(subsidiary) {
      var queryObj        = query.create({ type: 'customrecord_hf_subsidiary_to_domain' });
      var inActive        = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
      var subsidiaryQuery = queryObj.createCondition({ fieldId: 'custrecord_hf_sub_to_domain_subsidiary', operator: query.Operator.ANY_OF, values: [subsidiary] })
      queryObj.condition  = queryObj.and(inActive, subsidiaryQuery);
      queryObj.columns    = [
        queryObj.createColumn({ fieldId: 'id' }),
        queryObj.createColumn({ fieldId: 'custrecord_hf_sub_to_domain_subsidiary', alias: 'subsidiary' }),
        queryObj.createColumn({ fieldId: 'custrecord_hf_sub_to_domain_domain', alias: 'domain' }),
        queryObj.createColumn({ fieldId: 'custrecord_hf_sub_to_domain_sitename', alias: 'siteName' }),
        queryObj.createColumn({ fieldId: 'custrecord_hf_sub_to_domain_domain', alias: 'domainName', context: query.FieldContext.DISPLAY }),
      ];

      var results  = [];
      var runQuery = queryObj.runPaged({ pageSize: 5000 });
      var iterator = runQuery.iterator();
      iterator.each(function (resultPage) {
        var currentPageData = resultPage.value.data.asMappedResults();
        for (var result = 0; result < currentPageData.length; result++) {
          log.debug('result', currentPageData[result]);
          results.push( currentPageData[result]);
        }
        return true;
      });
      log.debug('results', results);
      return results;
    }
  };
})
