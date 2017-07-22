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
  "datatables",
  "angular-rating"
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
        // console.log(user);
        // console.log($state.current);
        if (!$state.current.data.auth) {
          $state.go("dashboard", {}, { reload: true });
        }
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
        data: { pageTitle: "Log Masuk", auth: false },
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
        data: { pageTitle: "Lupa Kata Laluan", auth: false },
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
        data: { pageTitle: "Sign Up", auth: false },
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
        data: { pageTitle: "Admin Dashboard Template", auth: true },
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
        data: { pageTitle: "Manage Category", auth: true },
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
        data: { pageTitle: "Manage Slots", auth: true },
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
        data: { pageTitle: "Manage Sites/Tapak", auth: true },
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
      // Users
      .state("users", {
        url: "/users",
        templateUrl: "views/users/foodtruck.html",
        data: { pageTitle: "Users - Foodtruck", type: "foodtruck", auth: true },
        controller: "UsersController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/UsersController.js"]
              });
            }
          ]
        }
      })
      // Users - Foodtruck
      .state("users.foodtruck", {
        url: "/users/foodtruck",
        templateUrl: "views/users/foodtruck.html",
        data: { pageTitle: "Users - Foodtruck", type: "foodtruck", auth: true },
        controller: "UsersController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/UsersController.js"]
              });
            }
          ]
        }
      })
      // Users - Public
      .state("users.public", {
        url: "/users/public",
        templateUrl: "views/users/public.html",
        data: { pageTitle: "Users - Public", type: "public", auth: true },
        controller: "UsersController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/UsersController.js"]
              });
            }
          ]
        }
      })
      // Users - Event Org.
      .state("users.event_organizer", {
        url: "/users/event_organizer",
        templateUrl: "views/users/event_organizer.html",
        data: {
          pageTitle: "Users - Event Organizer",
          type: "event_organizer",
          auth: true
        },
        controller: "UsersController",
        resolve: {
          deps: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load({
                name: "MetronicApp",
                insertBefore: "#ng_load_plugins_before", // load the above css files before '#ng_load_plugins_before'
                files: ["js/controllers/UsersController.js"]
              });
            }
          ]
        }
      })
      // User Profile
      .state("profile", {
        url: "/profile",
        templateUrl: "views/profile/main.html",
        data: { pageTitle: "User Profile", auth: true },
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
        data: { pageTitle: "User Profile", auth: true }
      });
    // Blank Page
    // .state("blank", {
    //   url: "/blank",
    //   templateUrl: "views/blank.html",
    //   data: { pageTitle: "Blank Page Template" },
    //   controller: "BlankController",
    //   resolve: {
    //     deps: [
    //       "$ocLazyLoad",
    //       function($ocLazyLoad) {
    //         return $ocLazyLoad.load({
    //           name: "MetronicApp",
    //           insertBefore: "#ng_load_plugins_before", // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
    //           files: ["js/controllers/BlankController.js"]
    //         });
    //       }
    //     ]
    //   }
    // });
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
