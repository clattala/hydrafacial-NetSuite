/// <amd-module name="SuiteCommerce.ProductComparison.RecordSearcher.Suggestion.View"/>
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
define("SuiteCommerce.ProductComparison.RecordSearcher.Suggestion.View", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RecordSuggestionSearcherView = /** @class */ (function (_super) {
        __extends(RecordSuggestionSearcherView, _super);
        function RecordSuggestionSearcherView(options) {
            var _this = _super.call(this, options) || this;
            _this.model = options.model;
            _this.events = {
                'click [data-action="record-searcher-open-record"]': 'suggestionClicked',
            };
            return _this;
        }
        RecordSuggestionSearcherView.prototype.suggestionClicked = function () {
            this.model.isSuggestionSelected = true;
        };
        return RecordSuggestionSearcherView;
    }(Backbone_1.View));
    exports.RecordSuggestionSearcherView = RecordSuggestionSearcherView;
});
