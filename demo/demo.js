/*global jQuery */

(function ($) {

    "use strict";

    $(document).ready(function () {

        $("#cats").tabs();

        $("#fancy-cats").tabs({

            // Set the tab at index 1 to be displayed initially.
            selected: 1,

            // Animate the transitions.
            showPage: function (elem) {
                elem.css({
                    "z-index": 1
                });
                elem.fadeIn(1000);
            },
            hidePage: function (elem) {
                elem.css({
                    "z-index": 0
                });
                elem.fadeOut(1000);
            }

        });

        $("#futurama").tabs({

            // Allow all pages to be hidden at once.
            allowNone: true,

            // Do not allow more than one page showing at once.
            allowMultiple: true,

            // No initial selection.
            selected: false,

            // Tabs will be top-level definition terms.
            locateTabs: function (elemTabSet) {
                return elemTabSet.children("dt");
            },

            // The DD following a DT will be its correspoding page.
            locatePages: function (elemTab) {
                return elemTab.next("dd");
            }

        });

        // Bind some events for when a tab is selected or deselected.
        $("#futurama > dt").on("selected.lucidtabs", function () {
            $("#messages").append($("<p></p>").text("Hello, " + $(this).text() + "!"));
        });
        $("#futurama > dt").on("deselected.lucidtabs", function () {
            $("#messages").append($("<p></p>").text("Goodbye, " + $(this).text() + "!"));
        });

        $("#letters").tabs({

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

            // Pages will be spans with data-type attributes matching the tabs.
            locatePages: function (elemTab, elemTabSet) {
                var dt = elemTab.attr("data-type");
                return elemTabSet.find("span[data-type=\"" + dt + "\"]");
            }

        });

    });

}(jQuery));
