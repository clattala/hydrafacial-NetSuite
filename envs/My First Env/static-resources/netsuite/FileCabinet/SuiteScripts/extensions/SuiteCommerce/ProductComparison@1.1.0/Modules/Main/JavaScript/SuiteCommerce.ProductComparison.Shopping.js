/// <amd-module name="SuiteCommerce.ProductComparison.Shopping"/>
define("SuiteCommerce.ProductComparison.Shopping", ["require", "exports", "SuiteCommerce.ProductComparison.Common.StorableItem.Collection", "SuiteCommerce.ProductComparison.PLP", "SuiteCommerce.ProductComparison.ComparisonPage", "SuiteCommerce.ProductComparison.Common.Configuration", "SuiteCommerce.ProductComparison.Common.InstrumentationHelper"], function (require, exports, StorableItem_Collection_1, PLP, ComparisonPage_1, Configuration_1, InstrumentationHelper_1) {
    "use strict";
    var MAX_ITEMS_TO_COMPARE = 4;
    return {
        mountToApp: function mountToApp(container) {
            Configuration_1.Configuration.environment = container.getComponent('Environment');
            InstrumentationHelper_1.InstrumentationHelper.initializeInstrumentation(container.getComponent('Environment'));
            var storableItemCollection = this.setupStorage();
            this.initializeModules(container, storableItemCollection);
        },
        setupStorage: function () {
            var storableItemCollection = new StorableItem_Collection_1.StorableItemCollection();
            storableItemCollection.maxLength = MAX_ITEMS_TO_COMPARE;
            return storableItemCollection;
        },
        initializeModules: function (container, storableItemCollection) {
            PLP.mountToApp(container, storableItemCollection);
            ComparisonPage_1.ComparisonPageModule.mountToApp(container, storableItemCollection);
        },
    };
});
