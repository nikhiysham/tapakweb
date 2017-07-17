MetronicApp.factory("EnumService", [
  "CommonService",
  function(cmnSvc) {
    var src = {
      getBusinessCategory: function() {
        return [
          { code: "A", name: "Dropshipper" },
          { code: "B", name: "Stokis" },
          { code: "C", name: "Pemilik Produk" }
        ];
      },
      getStatesName: function() {
        return [
          "Johor",
          "Kedah",
          "Kelantan",
          "Kuala Lumpur",
          "Melaka",
          "Negeri Sembilan",
          "Pahang",
          "Perak",
          "Perlis",
          "Pulau Pinang",
          "Sabah",
          "Sarawak",
          "Selangor",
          "Terengganu"
        ];
      },
      getStates: function() {
        return [
          { code: "JHR", name: "Johor" },
          { code: "KDH", name: "Kedah" },
          { code: "KTN", name: "Kelantan" },
          { code: "KLR", name: "Kuala Lumpur" },
          { code: "MLK", name: "Melaka" },
          { code: "NSN", name: "Negeri Sembilan" },
          { code: "PHG", name: "Pahang" },
          { code: "PRK", name: "Perak" },
          { code: "PLS", name: "Perlis" },
          { code: "PNG", name: "Pulau Pinang" },
          { code: "SBH", name: "Sabah" },
          { code: "SWK", name: "Sarawak" },
          { code: "SGR", name: "Selangor" },
          { code: "TRG", name: "Terengganu" }
        ];
      },
      getCategoryTypeName: function(code) {
        switch (code) {
          case "beverages":
            return "Beverages";
          case "food":
            return "Food";
          case "desert":
            return "Desert";
        }
      },
      getMenuTypes: function() {
        return [
          { code: "beverages", name: "Beverages" },
          { code: "food", name: "Food" },
          { code: "desert", name: "Desert" }
        ];
      }
    };

    return src;
  }
]);
