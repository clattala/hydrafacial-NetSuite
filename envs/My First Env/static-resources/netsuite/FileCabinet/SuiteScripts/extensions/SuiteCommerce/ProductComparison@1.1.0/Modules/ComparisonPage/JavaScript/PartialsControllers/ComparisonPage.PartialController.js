/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller"/>
define("SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", ["require", "exports", "Handlebars"], function (require, exports, Handlebars) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PartialController = /** @class */ (function () {
        function PartialController() {
            this.prepareHelpers();
            this.registerPartial();
            if (this.helpers)
                this.registerHandlebarsHelpers();
        }
        PartialController.prototype.registerPartial = function () {
            Handlebars.registerPartial(this.partialName, this.template);
        };
        PartialController.prototype.registerHandlebarsHelpers = function () {
            this.helpers.forEach(function (helper) {
                Handlebars.registerHelper(helper.name, helper.helperAction);
            });
        };
        return PartialController;
    }());
    exports.PartialController = PartialController;
});
