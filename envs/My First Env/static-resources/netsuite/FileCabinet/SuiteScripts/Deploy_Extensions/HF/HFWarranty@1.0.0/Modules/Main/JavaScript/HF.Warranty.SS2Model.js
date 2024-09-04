define('HF.Warranty.SS2Model'
  , [
    'Backbone',
    'Utils'
  ], function (
    Backbone,
    Utils
  ) {
    'use strict';

    // @class HF.Warranty.SS2Model @extends Backbone.Model
    return Backbone.Model.extend({
      //@property {String} urlRoot
      urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath('Modules/Main/SuiteScript2/HF.Warranty.Service.ss'), true)
    });
  });
