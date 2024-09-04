define(
    'OrderWizard.Module.LiftGate'
    , ['Wizard.Module'
        , 'LiveOrder.Model'
        , 'Profile.Model'
        , 'SC.Configuration'
        , 'order_wizard_module_lift_gate.tpl'
        , 'jQuery'
        , 'underscore'

    ]
    , function (
        WizardModule
        , LiveOrderModel
        , ProfileModel
        , Configuration
        , order_wizard_module_lift_gate
        , jQuery
        , _


    ) {
        'use strict';
        //@class OrderWizard.Module.Comments @extends Wizard.Module
        return WizardModule.extend(
            {

                classname: "OrderWizard.Module.LiftGate",
                //@property {Function} template
                template: order_wizard_module_lift_gate
                //@method initialize
                , initialize: function (options) {

                    WizardModule.prototype.initialize.apply(this, arguments);
                    this.application = this.wizard.application;
                    this.pacejetConfig = Configuration.get("pacejet");
                }

                , events: {
                    'change #ltl': 'setLiftGate'
                }

                , setLiftGate: function (e) {
                    var isChecked = e.target.checked;
                    var options = this.wizard.model.get("options");
                    options.custbody_tt_lift_gate = isChecked ? "T" : "F"
                    this.wizard.model.set("options", options)
                    // Clear shipmethod
                    this.wizard.model.set("shipmethod", "");
                    this.model.save()

                }

                , present: function () {

                    return true;
                }

                , submit: function () {

                    // this.wizard.model.set('shipmethod', null);

                    return this.isValid();
                }
                , isValid: function () {
                    var promise = jQuery.Deferred()

                    return promise.resolve();

                }


                , getContext: function () {
                    var options = this.wizard.model.get("options");

                    var totalWeight = 0;
                    var LiveOrder = LiveOrderModel.getInstance();
                    var lines = LiveOrder.get("lines").models;

                    _.each(lines, function (line) {
                        totalWeight += (parseFloat(line.get("item").get("weight")) * parseInt(line.get("quantity")));
                    })

                    var showLtlOptionsWeight = parseInt(this.pacejetConfig.showLtlOver);

                    return {
                        showLiftGateOption: totalWeight > showLtlOptionsWeight,
                        selectedLiftGate: options.custbody_tt_lift_gate && options.custbody_tt_lift_gate == "T"
                    }
                }

            });
    });