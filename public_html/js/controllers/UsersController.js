angular.module("MetronicApp").controller("UsersController", [
  "$rootScope",
  "$scope",
  "$filter",
  "$q",
  "CommonService",
  "EnumService",
  "$timeout",
  "$state",
  "AngularFire",
  "DTOptionsBuilder",
  "DTColumnDefBuilder",
  "SessionService",
  function(
    $rootScope,
    $scope,
    $filter,
    $q,
    cmnSvc,
    enumSvc,
    $timeout,
    $state,
    angularFire,
    DTOptionsBuilder,
    DTColumnDefBuilder,
    sessionSvc
  ) {
    $scope.user = {};
    $scope.cmnSvc = cmnSvc;
    $scope.user = {};
    $scope.users = [];
    $scope.modalMode = "";
    $scope.dtInstance = {};
    $scope.types = enumSvc.getMenuTypes();
    $scope.authObj = angularFire.getAuth();
    $scope.authUser = sessionSvc.get("user_auth");
    $scope.currentStateUrl = $state.current.url;
    $scope.item = {};

    var storageRef = firebase.storage().ref();
    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
      "full_numbers"
    );
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3),
      DTColumnDefBuilder.newColumnDef(4),
      DTColumnDefBuilder.newColumnDef(5),
      DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];

    $scope.reloadDataTable = function() {
      $scope.dtInstance.rerender();
    };

    $scope.loadUsers = function(state) {
      if (state === "/users/foodtruck") {
        cmnSvc.showLoading();
        angularFire
          .getRef("users")
          .orderByChild("profile_type")
          .equalTo("foodtruck")
          .once("value")
          .then(
            function(snapshot) {
              var promises = [];
              snapshot.forEach(function(data) {
                var user = {};
                user = data.val();
                user.id = data.key;
                // console.log(user);
                var promise = $q(function(resolve, reject) {
                  angularFire
                    .getRef("companies")
                    .child(user.id)
                    .once("value")
                    .then(function(compSnapshot) {
                      if (!cmnSvc.isEmpty(compSnapshot.val())) {
                        var obj = {};
                        compSnapshot.forEach(function(data) {
                          obj.id = data.key;
                          obj.company_name = data.val().company_name;
                          obj.ft_name = data.val().ft_name;
                          obj.plate_no = data.val().plate_no;
                          obj.location = data.val().location;
                        });

                        user.company = obj;
                        resolve({ user: user });
                      } else {
                        resolve({ user: user });
                      }
                    })
                    .catch(function(error) {
                      reject(error);
                    });
                });
                promises.push(promise);
              });

              $q
                .all(promises)
                .then(function(responses) {
                  // console.log(responses);
                  var catPromises = [];
                  responses.forEach(function(data) {
                    if (!cmnSvc.isEmpty(data)) {
                      var promise = new Promise(function(resolve, reject) {
                        if (!cmnSvc.isEmpty(data.user.category_id)) {
                          angularFire
                            .getRef("categories")
                            .child(data.user.category_id)
                            .once("value")
                            .then(function(catSnapshot) {
                              var category = {};
                              category = catSnapshot.val();
                              category.id = catSnapshot.key;
                              data.user.category = category;
                              // console.log(data.user);
                              resolve({ user: data.user });
                            })
                            .catch(function(error) {
                              reject(error);
                            });
                        } else {
                          // console.log(data.user);
                          resolve({ user: data.user });
                        }
                      });

                      catPromises.push(promise);
                    }
                  });

                  return Promise.all(catPromises);
                })
                .then(function(responses) {
                  cmnSvc.hideLoading();

                  $scope.users = responses;
                  console.log("Users:", $scope.users);
                })
                .catch(function(error) {
                  cmnSvc.showAlert(
                    "alert",
                    "Error during load users [" + error + "]"
                  );
                });
            },
            function(error) {
              cmnSvc.showAlert(
                "alert",
                "Error during load users [" + error + "]"
              );
            }
          );
      } else if (state === "/users/public") {
      } else {
      }
    };

    $scope.loadUsers($scope.currentStateUrl);

    $scope.clearModal = function() {
      $scope.modalMode = "ADD";
      $scope.category = {};
    };

    $scope.giveStar = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        $scope.user = angular.copy(item);
        !cmnSvc.isEmpty($scope.user.user.star)
          ? ($scope.item.rate = $scope.user.user.star)
          : "";
        $("#addModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.submit = function(form) {
      if (!cmnSvc.isEmpty($scope.item.rate)) {
        cmnSvc.showLoading();
        angularFire
          .getRef("users")
          .child($scope.user.user.id)
          .update({ star: $scope.item.rate })
          .then(function(snapshot) {
            cmnSvc.hideLoading();
            $("#addModal").modal("hide");
            $timeout(function() {
              $state.transitionTo(
                $state.current,
                {},
                {
                  reload: true,
                  inherit: false,
                  notify: true
                }
              );
            }, 200);
            cmnSvc.showAlert("alert", "Star has been successfully updated");
          })
          .catch(function(error) {
            $("#addModal").modal("hide");
            cmnSvc.showAlert(
              "alert",
              "Error during update star [" + error.message + "]"
            );
          });
      } else {
        $("#addModal").modal("hide");
        cmnSvc.showAlert("alert", "Star is required!");
      }
    };
  }
]);
