define('EmptyCart.ServiceController', [
    'ServiceController',
    'SC.Models.Init',
], function defineEmptyCartServiceController(
    ServiceController,
    SCModelsInit
) {
    return ServiceController.extend({

        name: 'EmptyCart.ServiceController',

        delete: function deleteFn() {
            try {
                SCModelsInit.order.removeAllItems();
                return {
                    success: true
                };
            } catch (error) {
                nlapiLogExecution('ERROR', 'ERROR', error);
                return {
                    success: false,
                    message: 'Couldn\'t empty shopping cart.'
                };
            }

        }
    });
});
