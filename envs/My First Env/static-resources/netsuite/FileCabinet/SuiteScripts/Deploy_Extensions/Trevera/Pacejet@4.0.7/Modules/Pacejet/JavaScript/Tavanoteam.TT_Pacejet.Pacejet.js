
define(
	'Tavanoteam.TT_Pacejet.Pacejet'
	, [
		"OrderWizard.Module.LiftGate"
	]
	, function (OrderWizardModuleLiftGate) {
		'use strict';

		return {
			mountToApp: function mountToApp(container) {

				var checkout = container.getComponent('Checkout');
				if (checkout) {
					try {
						checkout.addModuleToStep({
							step_url: 'shipping/address'
							, module: {
								id: 'new_module'
								, index: 4
								, classname: 'OrderWizard.Module.LiftGate'
								, options: {

								}
							}
						})
					} catch (e) {
						console.log(e);
					}
				}
			}
		};
	});
