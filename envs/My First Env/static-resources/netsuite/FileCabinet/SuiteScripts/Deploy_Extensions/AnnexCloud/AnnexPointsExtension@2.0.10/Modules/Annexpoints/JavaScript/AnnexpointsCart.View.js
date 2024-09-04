define('AnnexpointsCart.View', [
  'QuestionsAndAnswersModule.Model',
  'Backbone',
  'Backbone.CompositeView',

  'LiveOrder.Model',
  'annex_points.tpl',
  'jQuery',
  'Utils',
  'underscore'
], function (
  AnnexConfigModel,
  Backbone,
  BackboneCompositeView,
  LiveOrder,
  additionalPointsViewTpl,
  jQuery,
  Utils,
  _
) {
  var ratio = 0.01;

  var acpoints;
  //console.log('AnnexpointsCart.View');
  return Backbone.View.extend({
    template: additionalPointsViewTpl,

    loadAnnexpointsModule: function () {

      var self = this;

    },
    initialize           : function (options) {
      var ratio                = 0.01;
      var userprofilecomponent = options.container.getComponent("UserProfile");
      var self                 = this;
      var pdp                  = options.pdp;

      userprofilecomponent.getUserProfile().then(function (profile) {
        // console.log("Profile",profile);
        // console.log(profile.customfields[1].value);
        if (profile.customfields[1].value == 'Silver Circle')
          ratio = 0.01;
        if (profile.customfields[1].value == 'White Star')
          ratio = 0.015;
        if (profile.customfields[1].value == 'Black Diamond')
          ratio = 0.02;
        // console.log(ratio);

        var acorder = LiveOrder.getInstance();
        // console.log(acorder.attributes.lines);
        var acprice = 0;
        for (var accnt = 0; accnt < acorder.attributes.lines.length; accnt++) {
          acprice += acorder.attributes.lines.models[accnt].attributes.total;
        }
        var acpoints = (ratio * acprice).toFixed(2);

        if (acpoints == "0.00") {
          var acmsg = "";
        }
        else if (acpoints == "1.00") {
          var acmsg = "You Will Earn " + acpoints + " point.";
        }
        else {
          var acmsg = "You Will Earn " + acpoints + " points.";
        }
        document.getElementById("acpoints").innerHTML = acmsg;

      });
      BackboneCompositeView.add(this);

      Backbone.View.prototype.initialize.apply(this, arguments);
      this.annexConfigModel = new AnnexConfigModel();
      this.annexConfigModel.fetch({
        data: {
          id: 'pdp'
        }
      }).done(function () {
        self.loadAnnexpointsModule();

      });
    },
    getContext           : function () {
      return {
        //acpoints: "You Will Earn "+acpoints+" Points."
      };
    }
  });
});
