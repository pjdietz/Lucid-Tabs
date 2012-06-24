/*global jQuery */

(function ($) {

    "use strict";

    $(document).ready(function () {

        // #cats uses the default options.
        $("#cats").tabs();
        
        $("#animated-cats").tabs({
            
            // Start with the second items displayed.
            // (0-based index)
            selected: 1,
            
            // Animate the transitions.
            showPage: function (elem) {
                elem.css({
                    "z-index": 1
                });
                elem.fadeIn(500);
            },
            hidePage: function (elem) {
                elem.css({
                    "z-index": 0
                });
                elem.fadeOut(500);
            }
            
        });

        // #accodion customizes which elements to use as tabs and pages.
        // It also adds custom animations for showPage and hidePage.
        $("#accordion").tabs({

            // Tabs will be top-level definition terms.
            locateTabs: function (elemTabSet) {
                return elemTabSet.children("dt");
            },

            // The DD following a DT will be its correspoding page.
            locatePages: function (elemTab) {
                return elemTab.next("dd");
            },

            // Animate the transitions.
            showPage: function (elem) {
                elem.slideDown(250);
            },

            hidePage: function (elem) {
                elem.slideUp(250);
            }

        });

        // #map provides a locatePages function that matches more than one
        // element. This is how multiple push pins are linked to one button.
        // It also introduces the options to allow no pages showing at once
        // (allowNone) and allow all more than one to show at one
        // (allowMultiple). Finally, is starts with all tabs "selected."
        $("#map").tabs({

            // Allow all pages to be hidden at once.
            allowNone: true,

            // Allow more than one to be shown at once.
            allowMultiple: true,

            // Initially show all pages.
            selected: "*",

            // Tabs will be buttons with data-type attributes.
            locateTabs: function (elemTabSet) {
                return elemTabSet.find("button[data-type]");
            },

            // Pages will be list items with class matching the tabs' data-type value.
            locatePages: function (elemTab, elemTabSet) {
                var dt = elemTab.attr("data-type");
                return elemTabSet.find("li." + dt);
            }

        });

    });

}(jQuery));
