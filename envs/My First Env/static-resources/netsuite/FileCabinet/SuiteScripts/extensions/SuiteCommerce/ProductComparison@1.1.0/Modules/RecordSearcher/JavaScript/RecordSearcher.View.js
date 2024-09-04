/// <amd-module name="SuiteCommerce.ProductComparison.RecordSearcher.View"/>
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
define("SuiteCommerce.ProductComparison.RecordSearcher.View", ["require", "exports", "underscore", "jQuery", "record_searcher.tpl", "SuiteCommerce.ProductComparison.RecordSearcher.EventsCatalog", "Backbone"], function (require, exports, _, jQuery, recordSearcherTpl, RecordSearcher_EventsCatalog_1, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InvalidKeysForSearch = ['Shift', 'Control', 'Alt', 'CapsLock', 'PageUp', 'PageDown',
        'End', 'Home', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Pause', 'Meta', 'Insert', 'PrintScreen',
        'ContextMenu', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Enter',
        'NumLock', 'ScrollLock'];
    var RecordSearcherView = /** @class */ (function (_super) {
        __extends(RecordSearcherView, _super);
        function RecordSearcherView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = recordSearcherTpl;
            _this.events = _this.getEventsHash();
            _this.on('afterViewRender', function () {
                _this.boxSearch = _this.$("[data-record-searcher-id=\"" + _this.searcherBoxId + "\"]");
            });
            _this.collection = _this.getCollection();
            _this.registerRecordSearcherEvents();
            return _this;
        }
        RecordSearcherView.prototype.getEventsHash = function () {
            var events = {};
            events["keyup [data-record-searcher-id=\"" + this.searcherBoxId + "\"]"] = 'onKeyUp';
            events["blur [data-record-searcher-id=\"" + this.searcherBoxId + "\"]"] = 'onBlur';
            return events;
        };
        RecordSearcherView.prototype.onKeyUp = function (event) {
            var key = event.key;
            var query = event.target.value;
            var queryForSearch = {};
            this.query = query;
            if (this.isInValidKeyForSearch(key)) {
                event.preventDefault();
            }
            else if (query.length >= this.queryMinLength) {
                queryForSearch[this.queryParam] = query;
                _.each(this.additionalParameters, function (parameter) {
                    _.extend(queryForSearch, parameter);
                });
                this.collection.trigger(RecordSearcher_EventsCatalog_1.EventsCatalog.EXECUTE_SEARCH, queryForSearch);
            }
            else if (this.collection.length > 0) {
                this.closeSuggestions();
                this.boxSearch.trigger('focus');
            }
        };
        RecordSearcherView.prototype.isInValidKeyForSearch = function (key) {
            return InvalidKeysForSearch.indexOf(key) !== -1;
        };
        RecordSearcherView.prototype.registerRecordSearcherEvents = function () {
            var _this = this;
            this.collection.on(RecordSearcher_EventsCatalog_1.EventsCatalog.OPEN_SUGGESTIONS, function () {
                _this.openSuggestions();
            });
            this.collection.on('change:isSuggestionSelected', function (changedModel) {
                _this.trigger(RecordSearcher_EventsCatalog_1.EventsCatalog.SUGGESTION_CLICKED, changedModel);
            });
        };
        RecordSearcherView.prototype.openSuggestions = function () {
            this.render();
            this.boxSearch.val(this.query);
            this.boxSearch.trigger('focus');
            this.highlightText(this.query);
        };
        RecordSearcherView.prototype.closeSuggestions = function () {
            this.collection.reset();
            this.render();
            this.boxSearch.val(this.query);
        };
        RecordSearcherView.prototype.onBlur = function () {
            setTimeout(_.bind(this.closeSuggestions, this), 200);
        };
        RecordSearcherView.prototype.highlightText = function (searchMask) {
            if (this.collection.length > 0) {
                this.$('[data-text-highlighter="true"]').each(function () {
                    var htmlContent = jQuery(this).html();
                    var regEx = new RegExp(searchMask, 'ig');
                    jQuery(this).html(htmlContent.replace(regEx, function (replacedText) {
                        return "<span class=\"highlighted\">" + replacedText + "</span>";
                    }));
                });
            }
        };
        RecordSearcherView.prototype.getContext = function () {
            return {
                isSearchDisabled: this.isSearchDisabled,
                templateLabels: {
                    title: this.title,
                    inputPlaceholder: this.inputPlaceholder,
                    helperText: this.helperText,
                },
                showSearchResults: this.collection.length > 0,
                searcherBoxId: this.searcherBoxId,
            };
        };
        return RecordSearcherView;
    }(Backbone_1.View));
    exports.RecordSearcherView = RecordSearcherView;
});
