angular.module("MetronicApp").controller("UserProfileController", [
  "$rootScope",
  "$scope",
  "$http",
  "$timeout",
  "$state",
  "CommonService",
  "AngularFire",
  "SessionService",
  "$q",
  function(
    $rootScope,
    $scope,
    $http,
    $timeout,
    $state,
    cmnSvc,
    angularFire,
    sessionSvc,
    $q
  ) {
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $scope.user = {};
    // $scope.authObj = angularFire.getAuth();
    $scope.authUser = sessionSvc.get("user_auth");

    $scope.loadUserProfile = function() {
      cmnSvc.showLoading();
      return $q(function(resolve, reject) {
        angularFire
          .getRef("users")
          .child($scope.authUser.uid)
          .once("value")
          .then(function(snapshot) {
            var obj = snapshot.val();
            obj.id = snapshot.key;
            // console.log($scope.user);
            resolve(obj);
          })
          .catch(function(error) {
            reject(error.message);
          });
      });
    };

    $scope.loadUserProfile().then(
      function(resp) {
        cmnSvc.hideLoading();
        $scope.user = resp;
      },
      function(error) {
        showAlert("alert", "Error during load profile [" + error.message + "]");
      }
    );
  }
]);
