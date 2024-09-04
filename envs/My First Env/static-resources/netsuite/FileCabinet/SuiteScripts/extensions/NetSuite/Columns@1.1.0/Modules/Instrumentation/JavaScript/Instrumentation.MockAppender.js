/// <amd-module name="SuiteCommerce.Columns.Instrumentation.MockAppender"/>
define("SuiteCommerce.Columns.Instrumentation.MockAppender", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockAppender = /** @class */ (function () {
        function MockAppender() {
        }
        MockAppender.prototype.info = function (data) {
            console.info('MockAppender - Info', data);
        };
        MockAppender.prototype.error = function (data) {
            console.error('MockAppender - Error', data);
        };
        MockAppender.prototype.ready = function () {
            return true;
        };
        MockAppender.getInstance = function () {
            if (!MockAppender.instance) {
                MockAppender.instance = new MockAppender();
            }
            return MockAppender.instance;
        };
        MockAppender.prototype.start = function (action, options) {
            return options;
        };
        MockAppender.prototype.end = function (startOptions, options) { };
        return MockAppender;
    }());
    exports.MockAppender = MockAppender;
});
