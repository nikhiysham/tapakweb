/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
  "ui.router",
  "ui.bootstrap",
  "oc.lazyLoad",
  "ui.utils.masks",
  "ngSanitize",
  "firebase",
  "ngDialog",
  "datatables"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config([
  "$ocLazyLoadProvider",
  function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config(
      {
        // global configs go here
      }
    );
  }
]);

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config([
  "$controllerProvider",
  function($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
  }
]);

//AngularFire init
MetronicApp.config([
  "$controllerProvider",
  function($controllerProvider) {
    var config = {
      apiKey: "AIzaSyCLcCfgd-OhK5VgjNhgV8vIAI6TKM2ApeI",
      authDomain: "foodtruck-e8c39.firebaseapp.com",
      databaseURL: "https://foodtruck-e8c39.firebaseio.com",
      projectId: "foodtruck-e8c39",
      storageBucket: "foodtruck-e8c39.appspot.com",
      messagingSenderId: "67915414966"
    };
    // Prod mode
    //            var config = {
    //              apiKey: "AIzaSyClBKi3BmZAXlh7HMFyG7xVB4LkiN9FfHk",
    //              authDomain: "senangkira-27a04.firebaseapp.com",
    //              databaseURL: "https://senangkira-27a04.firebaseio.com",
    //              projectId: "senangkira-27a04",
    //              storageBucket: "senangkira-27a04.appspot.com",
    //              messagingSenderId: "457929172319"
    //            };
    firebase.initializeApp(config);
  }
]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/

/* Setup global settings */
MetronicApp.factory("settings", [
  "$rootScope",
  function($rootScope) {
    // supported languages
    var settings = {
      layout: {
        pageSidebarClosed: false, // sidebar menu state
        pageContentWhite: true, // set page content layout
        pageBodySolid: false, // solid body color state
        pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
      },
      assetsPath: "../assets",
      globalPath: "../assets/global",
      layoutPath: "../assets/layouts/layout"
    };

    $rootScope.settings = settings;

    return settings;
  }
]);

/* Setup App Main Controller */
MetronicApp.controller("AppController", [
  "$scope",
  "$rootScope",
  "$state",
  "SessionService",
  "CommonService",
  "AngularFire",
  function($scope, $rootScope, $state, sessionSvc, cmnSvc, angularFire) {
    $scope.loginMode = true;
    $scope.cmnSvc = cmnSvc;
    $scope.authObj = angularFire.getAuth();

    $scope.authObj.$onAuthStateChanged(function(user) {
      if (user) {
        //                        console.log(user);
        $rootScope.authUser = user;
        $rootScope.userAuth = sessionSvc.get("user_auth");

        //                        $state.go('dashboard', {}, {reload: true});
      } else {
        sessionSvc.remove("user_auth");
        $state.go("welcome", {}, { reload: true });
      }
    });

    $scope.$on("$viewContentLoaded", function() {
      //App.initComponents(); // init core components
      //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
  }
]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
MetronicApp.controller("HeaderController", [
  "$scope",
  "$rootScope",
  "$state",
  "AngularFire",
  "CommonService",
  "$timeout",
  function($scope, $rootScope, $state, angularFire, cmnSvc, $timeout) {
    $scope.$on("$includeContentLoaded", function() {
      Layout.initHeader(); // init header
    });

    $scope.signOut = function() {
      angularFire
        .signOut()
        .then(function() {
          $timeout(function() {
            $rootScope.authUser = null;
            $state.go("welcome", {}, { reload: true });
          });
        })
        .catch(function(error) {
          $rootScope.authUser = null;
          cmnSvc.showAlert("alert", error.message);
        });
    };
  }
]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller("SidebarController", [
  "$state",
  "$scope",
  function($state, $scope) {
    $scope.$on("$includeContentLoaded", function() {
      Layout.initSidebar($state); // init sidebar
    });
  }
]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller("QuickSidebarController", [
  "$scope",
  function($scope) {
    $scope.$on("$includeContentLoaded", function() {
      setTimeout(function() {
        QuickSidebar.init(); // init quick sidebar
      }, 2000);
    });
  }
]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller("ThemePanelController", [
  "$scope",
  function($scope) {
    $scope.$on("$includeContentLoaded", function() {
      Demo.init(); // init theme panel
    });
  }
]);

/* Setup Layout Part - Footer */
MetronicApp.controller("FooterController", [
  "$scope",
  function($scope) {
    $scope.$on("$includeContentLoaded", function() {
      Layout.initFooter(); // init footer
    });
  }
]);

/* Setup Rounting For All Pages */
MetronicApp.config([
  "$stateProvider",
  "$urlRouterProvider",
  function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/welcome");

    $stateProvider
      // Welcome
      .state("welcome", {
        url: "/welcome",
        templateUrl: "views/welcome.html",
        data: { pageTitle: "Log Masuk" },
        controller: "WelcomeController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  "css/welcome.css",
                  "js/controllers/WelcomeController.js"
                ]
              });
            }
          ]
        }
      })
      // Forgot Password
      .state("forgot", {
        url: "/forgot",
        templateUrl: "views/forgot.html",
        data: { pageTitle: "Lupa Kata Laluan" },
        controller: "ForgotController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: ["css/welcome.css", "js/controllers/ForgotController.js"]
              });
            }
          ]
        }
      })
      // Registration
      .state("signup", {
        url: "/signup",
        templateUrl: "views/signup.html",
        data: { pageTitle: "Sign Up" },
        controller: "SignUpController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: ["css/welcome.css", "js/controllers/SignUpController.js"]
              });
            }
          ]
        }
      })
      // Dashboard
      .state("dashboard", {
        url: "/dashboard",
        templateUrl: "views/dashboard.html",
        data: { pageTitle: "Admin Dashboard Template" },
        controller: "DashboardController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  "../assets/global/plugins/morris/morris.css",
                  "../assets/global/plugins/morris/morris.min.js",
                  "../assets/global/plugins/morris/raphael-min.js",
                  "../assets/global/plugins/jquery.sparkline.min.js",
                  "../assets/pages/scripts/dashboard.min.js",
                  "js/controllers/DashboardController.js"
                ]
              });
            }
          ]
        }
      })
      // Category
      .state("category", {
        url: "/category",
        templateUrl: "views/category.html",
        data: { pageTitle: "Manage Category" },
        controller: "CategoryController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: [
                  // "../assets/global/plugins/datatables/datatables.min.css",
                  // "../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css",
                  // "../assets/global/plugins/datatables/datatables.all.min.js",
                  // "../bower_components/angular-datatables/dist/angular-datatables.min.js",
                  // "../assets/pages/scripts/table-datatables-managed.min.js",
                  "js/controllers/CategoryController.js"
                ]
              });
            }
          ]
        }
      })
      // Slots
      .state("slots", {
        url: "/slots",
        templateUrl: "views/slots.html",
        data: { pageTitle: "Manage Slots" },
        controller: "SlotsController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/SlotsController.js"]
              });
            }
          ]
        }
      })
      // Sites
      .state("sites", {
        url: "/sites",
        templateUrl: "views/sites.html",
        data: { pageTitle: "Manage Sites/Tapak" },
        controller: "SitesController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/SitesController.js"]
              });
            }
          ]
        }
      })
      // Blank Page
      .state("blank", {
        url: "/blank",
        templateUrl: "views/blank.html",
        data: { pageTitle: "Blank Page Template" },
        controller: "BlankController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: ["js/controllers/BlankController.js"]
              });
            }
          ]
        }
      })
      // AngularJS plugins
      .state("fileupload", {
        url: "/file_upload.html",
        templateUrl: "views/file_upload.html",
        data: { pageTitle: "AngularJS File Upload" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "angularFileUpload",
                  files: [
                    "../assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js"
                  ]
                },
                {
                  name: "MetronicApp",
                  files: ["js/controllers/GeneralPageController.js"]
                }
              ]);
            }
          ]
        }
      })
      // UI Select
      .state("uiselect", {
        url: "/ui_select.html",
        templateUrl: "views/ui_select.html",
        data: { pageTitle: "AngularJS Ui Select" },
        controller: "UISelectController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "ui.select",
                  insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                  files: [
                    "../assets/global/plugins/angularjs/plugins/ui-select/select.min.css",
                    "../assets/global/plugins/angularjs/plugins/ui-select/select.min.js"
                  ]
                },
                {
                  name: "MetronicApp",
                  files: ["js/controllers/UISelectController.js"]
                }
              ]);
            }
          ]
        }
      })
      // UI Bootstrap
      .state("uibootstrap", {
        url: "/ui_bootstrap.html",
        templateUrl: "views/ui_bootstrap.html",
        data: { pageTitle: "AngularJS UI Bootstrap" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "MetronicApp",
                  files: ["js/controllers/GeneralPageController.js"]
                }
              ]);
            }
          ]
        }
      })
      // Tree View
      .state("tree", {
        url: "/tree",
        templateUrl: "views/tree.html",
        data: { pageTitle: "jQuery Tree View" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "MetronicApp",
                  insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                  files: [
                    "../assets/global/plugins/jstree/dist/themes/default/style.min.css",
                    "../assets/global/plugins/jstree/dist/jstree.min.js",
                    "../assets/pages/scripts/ui-tree.min.js",
                    "js/controllers/GeneralPageController.js"
                  ]
                }
              ]);
            }
          ]
        }
      })
      // Form Tools
      .state("formtools", {
        url: "/form-tools",
        templateUrl: "views/form_tools.html",
        data: { pageTitle: "Form Tools" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "MetronicApp",
                  insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                  files: [
                    "../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css",
                    "../assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css",
                    "../assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css",
                    "../assets/global/plugins/typeahead/typeahead.css",
                    "../assets/global/plugins/fuelux/js/spinner.min.js",
                    "../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js",
                    "../assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js",
                    "../assets/global/plugins/jquery.input-ip-address-control-1.0.min.js",
                    "../assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js",
                    "../assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js",
                    "../assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js",
                    "../assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js",
                    "../assets/global/plugins/typeahead/handlebars.min.js",
                    "../assets/global/plugins/typeahead/typeahead.bundle.min.js",
                    "../assets/pages/scripts/components-form-tools-2.min.js",
                    "js/controllers/GeneralPageController.js"
                  ]
                }
              ]);
            }
          ]
        }
      })
      // Date & Time Pickers
      .state("pickers", {
        url: "/pickers",
        templateUrl: "views/pickers.html",
        data: { pageTitle: "Date & Time Pickers" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "MetronicApp",
                  insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                  files: [
                    "../assets/global/plugins/clockface/css/clockface.css",
                    "../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css",
                    "../assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css",
                    "../assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css",
                    "../assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css",
                    "../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js",
                    "../assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js",
                    "../assets/global/plugins/clockface/js/clockface.js",
                    "../assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js",
                    "../assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js",
                    "../assets/pages/scripts/components-date-time-pickers.min.js",
                    "js/controllers/GeneralPageController.js"
                  ]
                }
              ]);
            }
          ]
        }
      })
      // Custom Dropdowns
      .state("dropdowns", {
        url: "/dropdowns",
        templateUrl: "views/dropdowns.html",
        data: { pageTitle: "Custom Dropdowns" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load([
                {
                  name: "MetronicApp",
                  insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                  files: [
                    "../assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css",
                    "../assets/global/plugins/select2/css/select2.min.css",
                    "../assets/global/plugins/select2/css/select2-bootstrap.min.css",
                    "../assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js",
                    "../assets/global/plugins/select2/js/select2.full.min.js",
                    "../assets/pages/scripts/components-bootstrap-select.min.js",
                    "../assets/pages/scripts/components-select2.min.js",
                    "js/controllers/GeneralPageController.js"
                  ]
                }
              ]);
            }
          ]
        }
      })
      // Advanced Datatables
      .state("datatablesmanaged", {
        url: "/datatables/managed.html",
        templateUrl: "views/datatables/managed.html",
        data: { pageTitle: "Advanced Datatables" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: [
                  "../assets/global/plugins/datatables/datatables.min.css",
                  "../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css",
                  "../assets/global/plugins/datatables/datatables.all.min.js",
                  "../assets/pages/scripts/table-datatables-managed.min.js",
                  "js/controllers/GeneralPageController.js"
                ]
              });
            }
          ]
        }
      })
      // Ajax Datetables
      .state("datatablesajax", {
        url: "/datatables/ajax.html",
        templateUrl: "views/datatables/ajax.html",
        data: { pageTitle: "Ajax Datatables" },
        controller: "GeneralPageController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: [
                  "../assets/global/plugins/datatables/datatables.min.css",
                  "../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css",
                  "../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css",
                  "../assets/global/plugins/datatables/datatables.all.min.js",
                  "../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js",
                  "../assets/global/scripts/datatable.js",
                  "js/scripts/table-ajax.js",
                  "js/controllers/GeneralPageController.js"
                ]
              });
            }
          ]
        }
      })
      // User Profile
      .state("profile", {
        url: "/profile",
        templateUrl: "views/profile/main.html",
        data: { pageTitle: "User Profile" },
        controller: "UserProfileController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: [
                  "../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css",
                  "../assets/pages/css/profile.css",
                  "../assets/global/plugins/jquery.sparkline.min.js",
                  "../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js",
                  "../assets/pages/scripts/profile.min.js",
                  "js/controllers/UserProfileController.js"
                ]
              });
            }
          ]
        }
      })
      // User Profile Dashboard
      .state("profile.dashboard", {
        url: "/dashboard",
        templateUrl: "views/profile/dashboard.html",
        data: { pageTitle: "User Profile" }
      })
      // User Profile Account
      .state("profile.account", {
        url: "/account",
        templateUrl: "views/profile/account.html",
        data: { pageTitle: "User Account" }
      })
      // User Profile Help
      .state("profile.help", {
        url: "/help",
        templateUrl: "views/profile/help.html",
        data: { pageTitle: "User Help" }
      })
      // Todo
      .state("todo", {
        url: "/todo",
        templateUrl: "views/todo.html",
        data: { pageTitle: "Todo" },
        controller: "TodoController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: [
                  "../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css",
                  "../assets/apps/css/todo-2.css",
                  "../assets/global/plugins/select2/css/select2.min.css",
                  "../assets/global/plugins/select2/css/select2-bootstrap.min.css",
                  "../assets/global/plugins/select2/js/select2.full.min.js",
                  "../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js",
                  "../assets/apps/scripts/todo-2.min.js",
                  "js/controllers/TodoController.js"
                ]
              });
            }
          ]
        }
      });
  }
]);

/* Init global settings and run the app */
MetronicApp.run([
  "$rootScope",
  "settings",
  "$state",
  function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
  }
]);
