define(
    'AnnexCloud.AnnexCloudExtension.Prod', [
    'AdditionalMyAccount.Router',
    'AdditionalMyAccount.View',
	'underscore'
], function (
   AdditionalMyAccountRouter,
   AdditionalMyAccountView,
   _
) {
    'use strict';
	
	return {
			/*MenuItems: [
				function (application) {
                //this can be application or just a plain object
					return 	{
						id: 'loyalty',
						name: _('Loyalty').translate(),
						url: 'loyalty',
						index: 0
					};
				}
        ],*/
		
    mountToApp: function mountToApp(container) {
          
            var myAccountMenu = container.getComponent('MyAccountMenu');

                if(myAccountMenu) {
                    myAccountMenu.addGroup({
                        id: 'loyalty',
                        index: 6,
                        url: 'loyalty',
                        name: _.translate('LINQ Rewards')
                    });

                    return new AdditionalMyAccountRouter(container);
                }
				
			console.log(container.name);
            
            //myacount router registration for new page
            if (container.name === 'MyAccount.Full') {
                return new AdditionalMyAccountRouter(container);
                }

            }
    };
});
