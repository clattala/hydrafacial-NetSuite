/// <amd-module name="SuiteCommerce.MapAndContactUs.ExtMessage.View"/>
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
define("SuiteCommerce.MapAndContactUs.ExtMessage.View", ["require", "exports", "Backbone", "sc_ext_message.tpl"], function (require, exports, Backbone_1, MessageViewTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtMessageView = /** @class */ (function (_super) {
        __extends(ExtMessageView, _super);
        function ExtMessageView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = MessageViewTemplate;
            _this.events = {
                'click [data-action="ext-message-close-message"]': 'closeMessage',
            };
            return _this;
        }
        ;
        ExtMessageView.prototype.closeMessage = function () {
            this.remove();
        };
        ;
        ExtMessageView.prototype.getContext = function () {
            return {
                showMessage: this.model.message.length > 0,
                message: this.model.message,
                isClosable: this.model.closable,
                type: this.model.type ? this.model.type : '',
            };
        };
        return ExtMessageView;
    }(Backbone_1.View));
    exports.ExtMessageView = ExtMessageView;
});
