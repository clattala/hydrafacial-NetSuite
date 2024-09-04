var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("SuiteCommerce.ProductComparison.ComparisonPage.ItemValueColumn.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_item_value.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemValueColumnPartialController = /** @class */ (function (_super) {
        __extends(ItemValueColumnPartialController, _super);
        function ItemValueColumnPartialController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.fieldTypePartialMapping = {
                Swatch: 'swatchField',
                Text: 'textField',
                Date: 'dateField',
                Check: 'checkField',
                'Check/Cross': 'checkField',
                Link: 'linkField',
                Image: 'imageField',
            };
            return _this;
        }
        Object.defineProperty(ItemValueColumnPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemValueColumnPartialController.prototype, "partialName", {
            get: function () {
                return 'itemValueColumn';
            },
            enumerable: true,
            configurable: true
        });
        ItemValueColumnPartialController.prototype.prepareHelpers = function () {
            var _this = this;
            this.helpers = [
                {
                    name: 'getFieldValueForItem',
                    helperAction: function (item, fieldId) {
                        return item[fieldId];
                    },
                },
                {
                    name: 'getPartialForField',
                    helperAction: function (fieldType) {
                        return _this.fieldTypePartialMapping[fieldType];
                    },
                },
            ];
        };
        return ItemValueColumnPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.ItemValueColumnPartialController = ItemValueColumnPartialController;
});
