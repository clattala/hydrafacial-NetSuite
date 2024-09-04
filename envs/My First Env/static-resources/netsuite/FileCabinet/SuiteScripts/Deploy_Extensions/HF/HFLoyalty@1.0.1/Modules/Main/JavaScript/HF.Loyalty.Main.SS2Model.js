// @module HF Loyalty
define('HF.Loyalty.Main.SS2Model'
  , [
    'Backbone',
    'Utils'
  ]
  , function (
    Backbone,
    Utils
  ) {
    'use strict';

    // @class HF.Loyalty.Main.SS2Model @extends Backbone.Model
    return Backbone.Model.extend({
      //@property {String} urlRoot
      urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath('Modules/Main/SuiteScript2/HF.Loyalty.Service.ss'), true)
    });
  });
