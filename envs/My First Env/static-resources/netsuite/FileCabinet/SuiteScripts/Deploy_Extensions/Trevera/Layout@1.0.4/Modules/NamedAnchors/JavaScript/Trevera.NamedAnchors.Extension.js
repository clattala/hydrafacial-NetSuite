define(
    'Trevera.NamedAnchors.Extension'
    , [
        'underscore'
    ,   'jQuery'
    ]
    , function (
        _
    ,   jQuery
    ) {
        'use strict';

        return {
            getOffset: function (elementSelector) {
                if (jQuery.isNumeric(elementSelector)) {
                    return elementSelector;
                }

                if (elementSelector.indexOf("#") !== 0) elementSelector = "#" + elementSelector;

                var offset;
                if (typeof elementSelector === "string") offset = jQuery(elementSelector).offset();
                else offset = elementSelector.offset();

                return offset ? offset.top : 0;
            }

            , scrollToTab: function (e, selector) {
                var self = this;
                jQuery(e.target).on('shown.bs.tab', function () {
                    self.scrollToPosition(e, selector);

                }, this);
            }

            , scrollToPosition: function (e, selector) {
                var self = this;

                //console.log('scrollToPosition', selector, jQuery(selector));

                jQuery('html, body').animate({
                    scrollTop: self.getOffset(selector)
                }, 300);
            }

            , getUrlParameter: function (sParam) {
                var sPageURL = decodeURIComponent(window.location.search.substring(1));
                if (!sPageURL) {
                    var hashSplit = window.location.hash.split("?");
                    if (hashSplit.length === 2) {
                        sPageURL = decodeURIComponent(hashSplit[1]);
                    }
                }
                var sURLVariables = sPageURL.split('&'),
                    sParameterName,
                    i;

                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split('=');

                    if (sParameterName[0] === sParam) {
                        return sParameterName[1];
                    }
                }
            }

            , mountToApp: function mountToApp(container) {
                var self = this
                ,   Layout = container.getLayout();

                _.extend(Layout, {

                    scrollToTab: self.scrollToTab

                ,   scrollToPositionOnClick: function (eventParameter)
                    {
                        self.scrollToPosition(eventParameter, eventParameter.currentTarget.getAttribute('data-where'));
                    }

                ,   scrollToPositionOnLoad: function ()
                    {
                        var goToParam = self.getUrlParameter('go-to');

                        if (goToParam) {
                            setTimeout(function ()
                            {
                                self.scrollToPosition(null, "#"+goToParam);
                            }, 1000)
                        }
                    }
                });


                // adding events for elements of DOM with data-action="scroll-to" as parameter.
                _.extend(Layout.events, {
                    'click [data-action="go-to"]': 'scrollToPositionOnClick',
                    'click [data-where]': 'scrollToPositionOnClick'
                });

                // handle auto scroll in links
                Layout.on('afterAppendView', function ()
                {
                    //if(Configuration.get('developer.logginOn', false)) console.log('afterAppendTo - named anchors supported');
                    Layout.scrollToPositionOnLoad()
                });

            }
        };
    });
