// @module Hydrafacial.MultiSite
define('MultiSite.ProfileFields.SS2Model'
  , [
    'Singleton',
    'Backbone',
    'Utils',
    'underscore'
  ]
  , function (
    Singleton,
    Backbone,
    Utils,
    _
  ) {
    'use strict';

    var classProperties = _.extend({
      getPromise: function (requestArgs) {
        console.log('getPromise', requestArgs)
        var self = this;
        if (_.result(SC, 'isPageGenerator')) {
          return jQuery.Deferred().resolve();
        }
        var model_instance = this.getInstance();

        if (model_instance.modelLoad) {
          if (model_instance.isLoading) {
            model_instance.isLoading = false;
          }
        }
        else {
          model_instance.modelLoad = jQuery.Deferred();
          model_instance.fetch({ data: requestArgs }).done(function (resp) {
            // set attributes on model and force change event on session
            model_instance.set('subsidiary', resp.subsidiary);
            model_instance.trigger('change:subsidiary', model_instance, (model_instance.attributes && model_instance.attributes.subsidiary) || 0);
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

    // @class Soberlink.ProfileFields.Model @extends Backbone.Model
    return Backbone.CachedModel.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath("Modules/Extension/SuiteScript2/MultiSite.ProfileFields.Service.ss"), true),

        initialize: function (attributes, options) {
          _.extend(this, attributes);
          this.options = {};
          this.set('options', options);

          this.on('change:profileFields', function (model, profileFields) {
            model.set('profileFields', profileFields, { silent: false });
          });
          this.trigger('change:profileFields', this, (attributes && attributes.profileFields) || {});
        }
      }
      , classProperties);
  });
