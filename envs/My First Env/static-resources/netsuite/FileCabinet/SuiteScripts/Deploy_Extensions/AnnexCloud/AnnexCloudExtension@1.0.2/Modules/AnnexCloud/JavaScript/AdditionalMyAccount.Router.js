define('AdditionalMyAccount.Router', [
    'AdditionalMyAccount.View',
    'Backbone'
], function(
    AdditionalMyAccountView,
    Backbone
) {
    'use strict';
    return Backbone.Router.extend({
        routes: {
            'loyalty': 'showLoyalty'
        },
        initialize: function(application) {
            this.application = application;
        },
        showLoyalty: function() {
            var view = new AdditionalMyAccountView({
                application: this.application
            });
            view.showContent();
        }
    });
});
