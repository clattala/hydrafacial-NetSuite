// @module HF Loyalty
//TODO: this could be a singleton?
define('HF.Loyalty.History.SS2Model'
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
      urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath('Modules/Main/SuiteScript2/HF.LoyaltyHistory.Service.ss'), true)
    });
  });
