// Model.js
// -----------------------
// @module Case
define("Promotions.Extension.SS2Model"
  , [
    "Singleton",
    "Backbone",
    "Utils",
    "underscore"
  ]
  , function (
    Singleton,
    Backbone,
    Utils,
    _
  ) {
    "use strict";

    var classProperties = _.extend({
      getPromise: function (requestArgs) {
        console.log('getPromise', requestArgs)
        var self = this;

        if (_.result(SC, 'isPageGenerator')) {
          return jQuery.Deferred().resolve();
        }

        var model_instance = this.getInstance();

        /*if (this.resetPromiseForReload()) {
          model_instance.modelLoad = null;
        }*/

        if (model_instance.modelLoad) {
          if (model_instance.isLoading) {
            model_instance.isLoading = false;
          }
        }
        else {
          model_instance.modelLoad = jQuery.Deferred();
          model_instance.fetch({data: requestArgs}).done(function (resp) {
            model_instance.set('promotions', resp.promotions);
            model_instance.set('redemptions', resp.redemptions);
            model_instance.trigger('change:promotions', model_instance, (model_instance.attributes && model_instance.attributes.promotions) || {});
            model_instance.modelLoad.resolve.apply(this, arguments);
          }).fail(function () {
            model_instance.modelLoad.reject.apply(this, arguments);
          }).always(function () {
            if (model_instance.isLoading) {
              model_instance.isLoading = false;
            }
          });
        }

        return model_instance.modelLoad;
      }
    }, Singleton);

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.CachedModel.extend({
      //@property {String} urlRoot
      urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath("Modules/Extension/SuiteScript2/Promotions.Extension.Service.ss"), true),

      initialize: function (attributes, options) {
        _.extend(this, attributes);
        this.options = {};
        this.set('options', {});

        this.on('change:eligibility', function (model, eligibility) {
          model.set('eligibility', eligibility, {silent: false});
        });
        this.trigger('change:eligibility', this, (attributes && attributes.eligibility) || '');

        this.on('change:promotions', function (model, promotions) {
          model.set('promotions', promotions, {silent: false});
        });
        this.trigger('change:promotions', this, (attributes && attributes.promotions) || {});

        this.on('change:redemptions', function (model, redemptions) {
          model.set('redemptions', redemptions, {silent: false});
        });
        this.trigger('change:redemptions', this, (attributes && attributes.redemptions) || {});

        this.on('change:canClaim', function (model, canClaim) {
          model.set('canClaim', canClaim, {silent: false});
        });
        this.trigger('change:canClaim', this, (attributes && attributes.canClaim) || false);
      }
    }
    , classProperties);
  });
