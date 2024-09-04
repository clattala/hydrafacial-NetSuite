// SS2Model
// -----------------------
// @module TermsTracking
define('TermsTracking.Extension.SS2Model', ['Backbone', 'Utils'], function (
  Backbone,
  Utils
) {
  'use strict';

  return Backbone.Model.extend({
    //@property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath("Modules/Extension/SuiteScript2/TermsTracking.SS2.Service.ss"), true)
  });
});
