// Model.js
// -----------------------
// @module Case
define("Promotions.Extension.Model"
  , [
    "Backbone",
    "Utils",
    "underscore"
  ]
  , function (
    Backbone,
    Utils,
    _
  ) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
      //@property {String} urlRoot

      urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath("services/TreveraPromotions.Service.ss"), false)
    });
  });
