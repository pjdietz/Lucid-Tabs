/**
 * Lucid Tabs
 * Easy tabs with minimal markup.
 *
 * @preserve Version: 2.0.1
 * Copyright (c) 2013 PJ Dietz
 * http://pjdietz.com/jquery-plugins/lucid-tabs/
 *
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 */

/*global jQuery */

(function ($) {

    "use strict";

    var TabSet, Tab, Page;

    // Throughout this plugin, local variables with the prefix elem represent
    // jQuery elements.


    ////////////
    // TabSet //
    ////////////

    /**
     * A TabSet stores references to the tabs. This is top-level class for the
     * plugin, and most of the interaction should be done through TabSet
     * instances as they are able to select and deselect tabs safely, checking
     * for things such as if a TabSet should all multiple selection, etc.
     */
    TabSet = function (elemTabSet, options) {

        var elemTabs,
            elemTab,
            elemPage,
            tab,
            i,
            u;

        // Indicate that the TabSet is not yet initialized.
        this.initialized = false;

        // Merge the user's options with the defaults.
        this.options = $.extend({}, $.fn.tabs.defaults, options);

        // Find the starting selection.
        this.selected = this.options.selected;

        // Create an empty array to hold the Tab instances.
        this.tabs = [];

        // Reference the elements within the TabSet that represent tabs.
        elemTabs = this.options.locateTabs(elemTabSet);

        // Iterate over the tab elements.
        // Create a new Tab instance for each element and store it in this.tabs
        for (i = 0, u = elemTabs.length; i < u; i += 1) {

            elemTab = $(elemTabs[i]);
            elemPage = this.options.locatePages(elemTab, elemTabSet);

            // Hide the page.
            elemPage.hide();

            tab = new Tab(elemTab, elemPage, this);
            this.tabs.push(tab);

        }

        // Set the initial selection based on the options.
        if (this.options.selected !== false) {
            this.select(this.options.selected);
        }

        // Indicate that the initialization is complete.
        this.initialized = true;

    }; // TabSet

    TabSet.prototype = {

        // ---------------------------------------------------------------------
        // Public methods
        //
        // Methods exposed to the plugin

        /**
         * Return an array of indexes of the selected tabs.
         *
         * This method is exposed to the plugin:
         *    $(selector).tabs("getSelection");
         *
         * Note that this will return the selection for the first item matched
         * by the selector only and will break chainability.
         */
        getSelection: function () {

            var selection, i, u;

            selection = [];

            for (i = 0, u = this.tabs.length; i < u; i += 1) {

                if (this.tabs[i].selected) {
                    selection.push(i);
                }

            }

            return selection;

        }, // getSelection()

        /**
         * Select the tab or tabs indicated by the tab parameter.
         *
         * The method is exposed to the plugin:
         *     $(selector).tabs("select", tabs);
         *
         * The tab parameter may be:
         *    - An integer representing the 0-based index of the tab
         *    - An array of integers as 0-based indexes
         *    - "*" to mean select all tabs
         *    - A jQuery selector for a tab
         *    - A jQuery object for a tab
         */
        select: function (tab) {

            var i, u;

            if (tab instanceof Tab && tab.tabSet === this) {

                // tab is a Tab instance belonging to this TabSet.
                this.selectTab(tab);

            } else if (!isNaN(tab)) {

                // tab is a 0-based index.
                tab = this.getTabAtIndex(tab);

                if (tab) {
                    this.selectTab(tab);
                }

            } else if (tab === "*") {

                // * wildcard to select all tabs.
                this.selectAll();

            } else if ($.isArray(tab)) {

                // For arrays, run select on each member.
                for (i = 0, u = tab.length; i < u; i += 1) {
                    this.select(tab[i]);
                }

            } else if (typeof tab === "string") {

                // Treat strings as jQuery selectors.
                this.select($(tab));

            } else if (tab instanceof jQuery) {

                // jQuery selector: try to read the Tab from data.

                tab = tab.data("Tab");

                if (tab) {
                    this.select(tab);
                }

            }

        }, // select()

        /**
         * Deselect the tab or tabs indicated by the tab parameter.
         *
         * The method is exposed to the plugin:
         *     $(selector).tabs("select", tabs);
         *
         * The tab parameter may be:
         *    - An integer representing the 0-based index of the tab
         *    - An array of integers as 0-based indexes
         *    - "*" to mean select all tabs
         *    - A jQuery selector for a tab
         *    - A jQuery object for a tab
         */
        deselect: function (tab) {

            var i, u;

            if (tab instanceof Tab && tab.tabSet === this) {

                // tab is a Tab instance belonging to this TabSet.
                this.deselectTab(tab);

            } else if (!isNaN(tab)) {

                // tab is a 0-based index.
                tab = this.getTabAtIndex(tab);

                if (tab) {
                    this.deselectTab(tab);
                }

            } else if (tab === "*") {

                // * wildcard to deselect all tabs.

                // Ensure multiple selection is enabled.
                if (this.options.allowNone) {
                    this.deselectAll();
                }

            } else if ($.isArray(tab)) {

                // For arrays, run deselect on each member.
                for (i = 0, u = tab.length; i < u; i += 1) {
                    this.deselect(tab[i]);
                }

            } else if (typeof tab === "string") {

                // Treat strings as jQuery selectors.
                this.deselect($(tab));

            } else if (tab instanceof jQuery) {

                // jQuery selector: try to read the Tab from data.
                this.deselect(tab.data("Tab"));

            }

        }, // deselect()

        /**
         * Switch the state of the given tab.
         *
         * The tab parameter may be:
         *    - An integer representing the 0-based index of the tab
         *    - An array of integers as 0-based indexes
         *    - A jQuery selector for a tab
         *    - A jQuery object for a tab
         */
        toggle: function (tab) {

            if (tab instanceof Tab && tab.tabSet === this) {

                this.toggleTab(tab);

            } else if (!isNaN(tab)) {

                // Number: Lookup the tab at the given index.
                tab = this.getTabAtIndex(tab);

                if (tab) {
                    this.toggleTab(tab);
                }

            } else if (typeof tab === "string") {

                // For strings, try exploding it into an array.
                this.toggleTab($(tab));

            } else if (tab instanceof jQuery) {

                // jQuery selector: try to read the Tab from data.

                tab = tab.data("Tab");

                if (tab) {
                    this.toggleTab(tab);
                }

            }

        }, // toggle()

        // ---------------------------------------------------------------------
        // Private methods

        /**
         * Select all tabs. Only works if the tab set allows multiple selection.
         */
        selectAll: function () {

            var i, u;

            // Ensure multiple selection is enabled.
            if (this.options.allowMultiple) {

                for (i = 0, u = this.tabs.length; i < u; i += 1) {
                    this.tabs[i].select();
                }

            }

        }, // selectAll()

        /**
         * Select the passed Tab.
         */
        selectTab: function (tab) {

            var selection, i, u;

            // Check if the new tab is already selected.
            if (!tab.selected) {

                // Deselect the old tab, if not a multple select.
                if (!this.options.allowMultiple) {

                    selection = this.getSelection();

                    for (i = 0, u = selection.length; i < u; i += 1) {
                        this.tabs[selection[i]].deselect();
                    }

                }

                // Select the new tab.
                tab.select();

            }

        }, // selectTab()

        /**
         * Deselect all of the tabs. Only avaiable if the tab set allows no tabs
         * to be selected.
         */
        deselectAll: function () {

            var i, u;

            if (this.options.allowNone) {

                for (i = 0, u = this.tabs.length; i < u; i += 1) {
                    this.tabs[i].deselect();
                }

            }

        }, // deselectAll()

        /**
         * Deselect the tab at the passed 0-based index if it is selected. Also
         * safegaurds against deselecting the only selected tab if the tab set
         * does not allow no selection.
         */
        deselectByIndex: function (index) {

            // Ensure the tab is selected.
            if (this.tabs[index].selected) {

                // Ensure the TabSet either allows no selection or that there
                // is at least one other tab selected.
                if (this.options.allowNone || this.getSelection().length > 1) {
                    this.tabs[index].deselect();
                }

            }

        }, // deselectByIndex()

        /**
         * Deselect the passed Tab.
         */
        deselectTab: function (tab) {

            // Ensure the tab is selected.
            if (tab.selected) {

                // Ensure the tab set either allows no selection or that there
                // is at least one other tab selected.
                if (this.options.allowNone || this.getSelection().length > 1) {
                    tab.deselect();
                }

            }

        }, // deselectTab()

        /**
         * Select or deselect the passed tab to the opposite state.
         */
        toggleTab: function (tab) {

            // A Tab instance that is part of this TabSet.
            if (tab.selected) {
                this.deselectTab(tab);
            } else {
                this.selectTab(tab);
            }

        }, // toggleTab()

        /**
         * Return the Tab instance that is at the given 0-based index.
         * A return value of false indicates an error.
         *
         * @param number index
         * @param object
         */
        getTabAtIndex: function (index) {

            index = parseInt(index, 10);

            // Ensure the index is within range.
            if (!isNaN(index) && index >= 0 && index < this.tabs.length) {
                return this.tabs[index];
            }

            return false;

        }, // getTabAtIndex()

        /**
         * Return the index of the passed tab. If the passed tab is not in the
         * array, return false.
         *
         * @param object tab
         * @return mixed
         */
        getIndex: function (tab) {

            var i, u;

            if (tab instanceof Tab && tab.tabSet === this) {
                for (i = 0, u = this.tabs.length; i < u; i += 1) {
                    if (this.tabs[i] === tab) {
                        return i;
                    }
                }
            }

            return false;

        } // getIndex()

    }; // TabSet.prototype


    /////////
    // Tab //
    /////////

    /**
     * A Tab store references to the TabSet to which is belongs and the Page
     * to which it points. A Tab is essentially a button that is linked to
     * another element (or multiple elements) to determine visiblity.
     */
    Tab = function (elemTab, elemPage, tabSet) {

        // Store a reference to the element for the Tab.
        this.elemTab = elemTab;

        // Store a reference to the Tab instance.
        elemTab.data("Tab", this);

        // Bind the event handler.
        elemTab.click(Tab.handleClick);

        // Store a new Page represneting the page or pages this tab points to.
        this.page = new Page(elemPage, this);

        // Store a reference to the TabSet this tab belongs to.
        this.tabSet = tabSet;

        // Set the initial selection state to not selected.
        this.selected = false;

    }; // Tab()

    Tab.prototype = {

        select: function () {

            var cls;

            if (!this.selected) {

                cls = this.tabSet.options.cssSelected;

                // Apply the CSS class change.
                if (typeof cls === "string" && !this.elemTab.hasClass(cls)) {
                    this.elemTab.addClass(cls);
                }

                this.page.show();
                this.selected = true;
                this.elemTab.trigger("selected");

            }

        }, // select()

        deselect: function () {

            var cls = this.tabSet.options.cssSelected;

            if (this.selected) {

                // Apply the CSS class change.
                if (typeof cls === "string" && this.elemTab.hasClass(cls)) {
                    this.elemTab.removeClass(cls);
                }

                this.page.hide();
                this.selected = false;
                this.elemTab.trigger("deselected.lucidtabs");

            }

        } // deselect()

    }; // Tab.prototype

    /**
     * Event handler for a Tab element's click event.
     */
    Tab.handleClick = function (event) {

        var tab;

        // Find the Tab instance for the element.
        tab = $(this).data("Tab");

        // Toggle the Tab.
        tab.tabSet.toggle(tab);

        return false;

    }; // handleClick()


    //////////
    // Page //
    //////////

    Page = function (elemPage, tab) {

        // Store the reference to the element or elements this Page represents.
        this.elemPage = elemPage;

        // Store a reference to the Tab this Page belongs to.
        this.tab = tab;

        // Set the initial visiblity flag to false.
        this.visible = false;

    }; // Page

    Page.prototype = {

        show: function () {
            if (!this.visible) {
                if (this.tab.tabSet.initialized) {
                    this.tab.tabSet.options.showPage(this.elemPage);
                } else {
                    this.elemPage.show();
                }
                this.visible = true;
            }
        },

        hide: function () {
            if (this.visible) {
                this.tab.tabSet.options.hidePage(this.elemPage);
                this.visible = false;
            }
        }

    }; // Page.prototype


    // -------------------------------------------------------------------------
    // Extend jQuery

    $.fn.extend({

        tabs: function (method, options) {

            var rtn, getter;

            rtn = this.each(function () {

                var tabObj;

                // Try to read the TabSet from the element.
                tabObj = $(this).data("TabSet");

                // If no TabSet exists, create one with the first parameter
                // used as the options.
                if (tabObj === undefined) {
                    tabObj = new TabSet($(this), method);
                    $(this).data("TabSet", tabObj);
                }

                switch (method) {

                case "getSelection":
                    // Note: This will break chainability.
                    getter = tabObj.getSelection();
                    return false;

                case "select":
                    tabObj.select(options);
                    break;

                case "deselect":
                    tabObj.deselect(options);
                    break;

                case "toggle":
                    tabObj.toggle(options);
                    break;

                }

            }); // this.each()

            if (getter !== undefined) {
                return getter;
            }

            return rtn;

        }

    }); // $.fn.extend()

    // -------------------------------------------------------------------------
    // Default Options

    $.fn.tabs.defaults = {

        // Allow all tabs to be deselected
        allowNone: false,

        // All more than one tab to be selected
        allowMultiple: false,

        // Name of the CSS class to add to tab anchors when selected
        cssSelected: "selected",

        // Value for the initial selection
        selected: 0,

        // Function for locating the tabs (buttons) in the tab set
        locateTabs: function (elemTabSet) {

            // Find any anchors contained by this elements that link to IDs
            return elemTabSet.find("a[href^=#]");

        },

        // Function for locating the page a tab button points to
        locatePages: function (elemTab) {

            // Return the element with a selector matched ref of the page
            return $(elemTab.attr("href"));

        },

        // Function called to display a page
        showPage: function (elemPage) {
            elemPage.show();
        },

        // Function called to hide a page
        hidePage: function (elemPage) {
            elemPage.hide();
        }

    }; //  $.fn.tabs.defaults

}(jQuery));
