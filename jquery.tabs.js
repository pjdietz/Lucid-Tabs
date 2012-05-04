/**
 * Lucid Tabs
 * Easy tabs with minimal markup.
 *
 * Copyright (c) 2009 PJ Dietz
 * Version: 1.00
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://pjdietz.com/jquery-plugins/lucid-tabs/
 */

/*global jQuery */

(function ($) {

    var TabSet, Tab, Page;
    
    
    ////////////
    // TabSet //
    ////////////
    
    TabSet = function (elem, options) {
    
        var domTabs,
            domPage, domTab,
            tab,
            i, u;
        
        
        this.options = $.extend({}, TabSet.defaultOptions, options);
        this.selected = this.options.selected;
        this.tabs = [];    
        
        // Store a refernce to the TabSet object in data.
        elem.data("TabSet", this);
        
        // Use selector to locate the container element.
        // Find all contained anchors that may reference an element by ID. 
        domTabs = elem.find("a[href^=#]");
        
        // Iterate over the selected tabs.
        // Create a new Tab for each element and store it in this.tabs;
        for (i = 0, u = domTabs.length; i < u; i += 1) {
            
            domTab = $(domTabs[i]);    
            domPage =  $(domTab.attr("href"));   
            
            if (domPage.length === 1) {
                
                // Hide the page
                domPage.hide();
                
                tab = new Tab(domTab, domPage, this);
                this.tabs.push(tab);    
            }
            
        }    
        
        // Set the initial selection
        this.tabs[this.selected].select();
    
    };
    
    TabSet.prototype = {
        
        select: function (index) {

            // Index is an object. Retrieve its index (or -1).
            if (typeof index === "object") {
                index = this.getIndex(index);
            }

            // Ensure the index is in range.
            if (index < 0 || index > this.tabs.length) {
                return false;
            }
            
            // Don't select the selected tab
            if (index === this.selected) {
                return false;    
            }
            
            // Show the new before hiding the old to avoid scrolling when the
            // browser momentarily sees a shorter page.            
            this.tabs[index].select();
            this.tabs[this.selected].deselect();
            this.selected = index;
            
            return true;
        },
            
        // Return the index of the passed tab
        getIndex: function (tab) {
            
            var i, u;
            
            for (i = 0, u = this.tabs.length; i < u; i += 1) {
                if (this.tabs[i] === tab) {
                    return i;    
                }
            } 
            
            return -1;
                
        }
                
    };

    // Default Options for tab sets.
    // 
    // To customize a tab set on creation, pass an object containing the
    // members to redefine.
    //
    TabSet.defaultOptions = {
      
        // Index of the initially selected tab
        selected: 0,
        
        // Name of the CSS class to add to tab anchors when selected  
        cssSelected: 'selected',
        
        // Function called to display a page
        showPage: function (elem) {
            elem.show();
        },
        
        // Function called to hide a page
        hidePage: function (elem) {
            elem.hide();    
        }
               
    };        
    
    
    
    /////////
    // Tab //
    /////////
    
    Tab = function (domTab, domPage, tabSet) {
        
        this.domTab = domTab;
        this.tabSet = tabSet;
        
        // Store a reference to the wrapper Tab
        domTab.data('Tab', this);
        
        // Bind the event handler.
        domTab.click(Tab.handleClick);
        
        this.page = new Page(domPage, this);
    };

    Tab.prototype = {
        
        select: function () {
            
            var cls = this.tabSet.options.cssSelected;
            
            if (!this.domTab.hasClass(cls)) {
                this.domTab.addClass(cls);
            }

            this.page.show();
        
        },
        
        deselect: function () {
            
            var cls = this.tabSet.options.cssSelected;
            
            if (this.domTab.hasClass(cls)) {
                this.domTab.removeClass(cls);
            }

            this.page.hide();
        } 
           
    };
    
    Tab.handleClick = function (event) {
        
        var tab = $(event.target).data('Tab');
        tab.tabSet.select(tab);

        return false;    
    };
    
    
    
    //////////
    // Page //
    //////////
    
    Page = function (domPage, tab) {
        
        this.domPage = domPage;
        this.tab = tab;
        
        // Store a reference to the wrapper Page
        domPage.data('Page', this);
    };
    
    Page.prototype = {
                
        show: function () {
            if (this.domPage.is(":hidden")) {
                this.tab.tabSet.options.showPage(this.domPage);
            }
        },
        
        hide: function () {
            if (this.domPage.is(":visible")) {
                this.tab.tabSet.options.hidePage(this.domPage);
        
            }
        }
    };    

    
    
    // Extend jQuery -----------------------------------------------------------
        
    $.fn.extend({  
        tabs: function (options) {
            return this.each(function () {
                var dummy = new TabSet($(this), options);
            });
        }
    });      
    
}(jQuery));


/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, 
  eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */