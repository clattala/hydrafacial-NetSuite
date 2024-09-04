define('HF.CustomNavigation.Model'
  , [
    'SC.Model'
  ],
  function HFCustomNavigationModel(
    SCModel
  ) {
    'use strict';

    return SCModel.extend({
      name: 'HFCustomNavigation',

      loadCustomNavigationData: function loadCustomNavigationData() {
        var result = {};
        try {
          var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trv_load_nav_file', 'customdeploy_trv_load_nav_file', true);
          var requestUrl  = nlapiRequestURL(suiteletUrl, null);
          var body        = requestUrl.getBody();
          nlapiLogExecution('error', 'suiteletUrl', suiteletUrl);
          nlapiLogExecution('error', 'requestUrl.getBody()', typeof body);
          result = body;
        } catch (e) {
          nlapiLogExecution('error', 'Processor Exception', e);
        }
        return result;
      }
    });
  });
