MetronicApp.factory('SessionService',
        ['$rootScope', '$window',
            function ($rootScope, $window) {

                return {
                    set: function (key, item) {
                        return $window.localStorage.setItem(key, angular.toJson(item));
                    },
                    get: function (key) {
                        return angular.fromJson($window.localStorage.getItem(key));
                    },
                    remove: function (key) {
                        return $window.localStorage.removeItem(key);
                    }
                };

            }]);