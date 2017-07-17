angular.module("MetronicApp").controller("CategoryController", [
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
    $scope.category = {};
    $scope.categories = [];
    $scope.modalMode = "";
    $scope.dtInstance = {};
    $scope.types = enumSvc.getMenuTypes();
    $scope.authObj = angularFire.getAuth();
    $scope.authUser = sessionSvc.get("user_auth");
    var storageRef = firebase.storage().ref();

    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
      "full_numbers"
    );
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3),
      DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];

    $scope.reloadDataTable = function() {
      $scope.dtInstance.rerender();
    };

    $scope.loadCategories = function() {
      return $q(function(resolve, reject) {
        angularFire.getRef("categories").once(
          "value",
          function(snapshot) {
            // console.log(snapshot.val());
            var list = [];
            snapshot.forEach(function(data, ind) {
              var obj = {};
              obj.id = data.key;
              obj.type = data.val().type;
              obj.name = data.val().name;
              obj.quota = data.val().quota;
              list.push(obj);
            });
            resolve(list);
          },
          function(error) {
            console.log(error);
          }
        );
      });
    };

    $scope
      .loadCategories()
      .then(function(resp) {
        $scope.categories = resp;
        // console.log("Resp:", resp);
      })
      .catch(function(error) {
        cmnSvc.showAlert("alert", error);
      });

    $scope.getTypeName = function(code) {
      return enumSvc.getCategoryTypeName(code);
    };

    $scope.clearCategory = function() {
      $scope.modalMode = "ADD";
      $scope.category = {};
    };

    $scope.edit = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        // angularFire.getRef('categories').child(type).child(id).update({})
        $scope.category = angular.copy(item);
        $("#addCategoryModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.delete = function(item) {
      if (!cmnSvc.isEmptyObject(item)) {
        cmnSvc.showLoading();
        angularFire
          .getRef("categories")
          .child(item.type)
          .child(item.id)
          .remove(function(error) {
            cmnSvc.hideLoading();
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
            if (error) {
              cmnSvc.showAlert(
                "alert",
                "Error delete " + item.name + " : " + JSON.stringify(error)
              );
            } else {
              cmnSvc.showAlert(
                "alert",
                item.name + " has been successfully deleted"
              );
            }
          });
      }
    };

    $scope.submit = function(form) {
      if (!form.$invalid) {
        if ($scope.modalMode === "ADD") {
          cmnSvc.showLoading();
          var obj = angular.copy($scope.category);
          angularFire.getRef("categories").push().set(obj, function(error) {
            $("#addCategoryModal").modal("hide");
            cmnSvc.hideLoading();
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
            if (error) {
              cmnSvc.showAlert("alert", error.message);
            } else {
              cmnSvc.showAlert(
                "alert",
                "Category " + obj.name + " has been successfully added"
              );
              $scope.category = {};
              form.$submitted = false;
            }
          });
        } else {
          if (!cmnSvc.isEmpty($scope.category.id)) {
            var obj = angular.copy($scope.category);
            cmnSvc.showLoading();
            angularFire
              .getRef("categories")
              .child(obj.id)
              .update({
                name: obj.name,
                type: obj.type,
                quota: obj.quota
              })
              .then(function() {
                $("#addCategoryModal").modal("hide");
                cmnSvc.hideLoading();
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
                cmnSvc.showAlert(
                  "alert",
                  "Category " + obj.name + " has been successfully updated"
                );
              })
              .catch(function(error) {
                cmnSvc.showAlert(
                  "alert",
                  "Error update category :" + JSON.stringify(error)
                );
              });
          } else {
            cmnSvc.showAlert("alert", "Category Id is required!");
          }
        }
      }
    };
  }
]);
