define('Annexpoints.View', [
    'QuestionsAndAnswersModule.Model',
    'Backbone',
	'Backbone.CompositeView',
	//'Profile.Model',
   // 'LiveOrder.Model',
    'annex_points.tpl',
    'jQuery',
    'Utils',
    'underscore'
], function(
    AnnexConfigModel,
    Backbone,
	BackboneCompositeView,
	//ProfileModel,
  //  LiveOrder,
    additionalPointsViewTpl,
    jQuery,
    Utils,
    _
) {


 var acpoints;
 
    return Backbone.View.extend({
        template: additionalPointsViewTpl,

        loadAnnexpointsModule: function() {

            var self = this;
            
},
        initialize: function(options) {
            var ratio = 0.01;
            var userprofilecomponent = options.container.getComponent("UserProfile");
            
            var self = this;
            var pdp = options.pdp;
            var item_model = pdp.getItemInfo().item;
            var ac_price = item_model.keyMapping_price;
			userprofilecomponent.getUserProfile().then(function(profile) {
               // console.log("Profile",profile);
			   // console.log(profile.customfields[1].value);
                if(profile.customfields[1].value=='Silver Circle')
                ratio=0.01;
                if(profile.customfields[1].value=='White Star')
                ratio=0.015;
                if(profile.customfields[1].value=='Black Diamond')
                ratio=0.02;
			  // console.log(ratio);

               var acpdp = options.container.getComponent('PDP');
               var acprice = acpdp.getItemInfo().item.keyMapping_price;
               var acpoints = ratio *  acprice;
               

               if(acpoints=="0")
                    {
                    var acmsg="";        
                    }
                     else if(acpoints=="1")
                     {
                     var acmsg = "You Will Earn " +parseFloat(acpoints).toFixed(2)+ " point.";
                     }
                     else
                     {
                     var acmsg = "You Will Earn " +parseFloat(acpoints).toFixed(2)+ " points.";
                     }
                document.getElementById("acpoints").innerHTML = acmsg;

			});

           
                //acpoints = item_model.keyMapping_price * ratio;
        
			 BackboneCompositeView.add(this);
		
			Backbone.View.prototype.initialize.apply(this, arguments);
            this.annexConfigModel = new AnnexConfigModel();
            this.annexConfigModel.fetch({
                data: {
                    id: 'pdp'
                }
            }).done(function() {
                self.loadAnnexpointsModule();
              
            });
        },
        getContext: function() {
        return {
			//acpoints: "You Will Earn "+acpoints+" Points."
        };
        }
    });
});