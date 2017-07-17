angular.module("MetronicApp").controller("SlotsController", [
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
    $scope.slot = {};
    $scope.slots = [];
    $scope.site = {};
    $scope.sites = [];
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
      DTColumnDefBuilder.newColumnDef(3).notSortable()
    ];

    $scope.reloadDataTable = function() {
      $scope.dtInstance.rerender();
    };

    $scope.loadSites = function() {
      return $q(function(resolve, reject) {
        angularFire.getRef("sites").once(
          "value",
          function(snapshot) {
            var list = [];
            snapshot.forEach(function(data, ind) {
              var obj = {};
              obj.id = data.key;
              obj.name = data.val().name;
              obj.description = data.val().description;
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

    $scope.loadCategories = function() {
      return $q(function(resolve, reject) {
        angularFire.getRef("categories").once(
          "value",
          function(snapshot) {
            // console.log(snapshot.val());
            var list = [];
            snapshot.forEach(function(data, ind) {
              // data.forEach(function(childData, indx1) {
              var obj = {};
              obj.id = data.key;
              obj.type = data.val().type;
              obj.name = data.val().name;
              obj.quota = data.val().quota;
              list.push(obj);
              // });
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
        if ($scope.categories.length > 0) {
          angular.forEach($scope.categories, function(val) {
            val.type = enumSvc.getCategoryTypeName(val.type);
          });
        }
      })
      .catch(function(error) {
        cmnSvc.showAlert("alert", error);
      });

    $scope.loadSlots = function() {
      return $q(function(resolve, reject) {
        angularFire.getRef("slots").child($scope.site.id).once(
          "value",
          function(snapshot) {
            var list = [];
            snapshot.forEach(function(data, ind) {
              var obj = {};
              obj.id = data.key;
              obj.category_id = data.val().category_id;
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
      .loadSites()
      .then(function(resp) {
        $scope.sites = resp;
        $scope.site.id = $scope.sites[0].id;

        $scope
          .loadSlots()
          .then(function(resp) {
            $scope.slots = resp;
            // console.log($scope.slots);
          })
          .catch(function(error) {
            cmnSvc.showAlert("alert", error);
          });
      })
      .catch(function(error) {
        cmnSvc.showAlert("alert", error);
      });

    $scope.getNameByCategoryId = function(catId) {
      var findObj = {};
      $scope.categories.filter(function(elem, idx) {
        if (elem.id === catId) {
          findObj = elem;
        }
      });
      return findObj.name;
    };

    $scope.updateSlots = function() {
      $scope
        .loadSlots()
        .then(function(resp) {
          $scope.slots = resp;
          // console.log($scope.slots);
        })
        .catch(function(error) {
          cmnSvc.showAlert("alert", error);
        });
    };

    $scope.clearSlot = function() {
      $scope.modalMode = "ADD";
      $scope.slot = {};
    };

    $scope.edit = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        $scope.slot = angular.copy(item);
        $("#addModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.delete = function(item) {
      // console.log(item);
      if (!cmnSvc.isEmptyObject(item)) {
        cmnSvc.showLoading();
        angularFire.getRef("slots").child(item.no).remove(function(error) {
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
              "Slot " + item.no + " has been successfully deleted"
            );
          }
        });
      }
    };

    $scope.submit = function(form) {
      if (!form.$invalid) {
        if ($scope.modalMode === "ADD") {
          cmnSvc.showLoading();
          var obj = angular.copy($scope.slot);
          angularFire
            .getRef("slots")
            .child($scope.slot.siteId)
            .child($scope.slot.no)
            .set({ category_id: obj.category_id }, function(error) {
              $("#addModal").modal("hide");
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
                  "Slot " + obj.no + " has been successfully added"
                );
                $scope.slot = {};
                form.$submitted = false;
              }
            });
        } else {
          if (
            !cmnSvc.isEmpty($scope.slot.id) &&
            !cmnSvc.isEmpty($scope.slot.siteId)
          ) {
            var obj = angular.copy($scope.slot);
            cmnSvc.showLoading();
            angularFire
              .getRef("slots")
              .child($scope.slot.siteId)
              .child($scope.slot.id)
              .update({
                category_id: obj.category_id,
                no: obj.no
              })
              .then(function() {
                $("#addModal").modal("hide");
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
                  "Slot " + obj.no + " has been successfully updated"
                );
              })
              .catch(function(error) {
                cmnSvc.showAlert(
                  "alert",
                  "Error update  :" + JSON.stringify(error)
                );
              });
          } else {
            cmnSvc.showAlert("alert", "Slot Id is required!");
          }
        }
      }
    };
  }
]);
