export const SCORING_DATA = {
  "system_version": "1.0.0",
  "alternative_groups": {
    "MAIN_TOP": {
      "description": "Thân trên chính (chọn đúng 1)",
      "allowed_categories": ["top", "outer_traditional", "outer_formal"]
    },
    "BOTTOM": {
      "description": "Thân dưới (chọn đúng 1)",
      "allowed_categories": ["bottom_pants", "bottom_skirt"]
    },
    "FOOTWEAR": {
      "description": "Giày dép (chọn đúng 1)",
      "allowed_categories": ["traditional_footwear", "shoes"]
    },
    "INNER": {
      "description": "Lớp lót trong",
      "allowed_categories": ["inner"]
    },
    "HEADWEAR": {
      "description": "Phụ kiện đội đầu",
      "allowed_categories": ["headwear"]
    },
    "ACCESSORIES": {
      "description": "Trang sức và phụ kiện đi kèm",
      "allowed_categories": ["jewelry"]
    }
  },
  "costume_rules": [
    {
      "costume_ids": ["V01_1", "V01_2", "V01"],
      "costume_name": "Áo dài tân thời (Nam / Nữ)",
      "required_components": {
        "groups": ["MAIN_TOP", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["HEADWEAR", "ACCESSORIES"],
        "recommended_items": ["h04_1", "h04_2", "j01", "j17", "j18"]
      }
    },
    {
      "costume_ids": ["V02"],
      "costume_name": "Áo tứ thân",
      "required_components": {
        "groups": ["MAIN_TOP", "INNER", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["HEADWEAR", "ACCESSORIES"],
        "recommended_items": ["h01_2", "h03", "j01", "v13", "cs_35"]
      }
    },
    {
      "costume_ids": ["V03"],
      "costume_name": "Áo yếm",
      "required_components": {
        "groups": ["INNER", "MAIN_TOP", "BOTTOM"],
        "outer_layer_mandatory": true
      },
      "optional_components": {
        "groups": ["ACCESSORIES", "FOOTWEAR"],
        "recommended_items": ["j01", "v13", "cs_35"]
      }
    },
    {
      "costume_ids": ["V04_1", "V04_2", "V04"],
      "costume_name": "Áo bà ba (Nam / Nữ)",
      "required_components": {
        "groups": ["MAIN_TOP", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["HEADWEAR", "ACCESSORIES"],
        "recommended_items": ["h02", "j03", "v13", "cs_35", "cs_38"]
      }
    },
    {
      "costume_ids": ["V05_1", "V05_2", "V05"],
      "costume_name": "Áo ngũ thân tay chẽn (Nam / Nữ)",
      "required_components": {
        "groups": ["MAIN_TOP", "INNER", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["HEADWEAR", "ACCESSORIES"],
        "recommended_items": ["h01_1", "h01_2", "j01", "j05", "j06", "cs_15", "cs_37"]
      }
    },
    {
      "costume_ids": ["V06", "V07", "V09_1", "V09_2", "V09"],
      "costume_name": "Đại lễ phục / Phẩm phục (Áo Tấc, Nhật Bình, Viên Lĩnh)",
      "required_components": {
        "groups": ["MAIN_TOP", "INNER", "BOTTOM", "FOOTWEAR"],
        "strict_bottom_whitelist": ["cs_03", "cs_04", "traditional_pant"]
      },
      "optional_components": {
        "groups": ["HEADWEAR", "ACCESSORIES"],
        "recommended_items": ["h01_1", "h01_2", "v11", "v12_1", "v12_2", "j01", "j13", "j19"]
      }
    },
    {
      "costume_ids": ["V08_1", "V08_2", "V08"],
      "costume_name": "Áo Giao Lĩnh (Nam / Nữ)",
      "required_components": {
        "groups": ["MAIN_TOP", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["INNER", "ACCESSORIES"],
        "recommended_items": ["j19", "cs_32", "cs_07", "cs_20", "cs_37"]
      }
    },
    {
      "costume_ids": ["V10"],
      "costume_name": "Áo Đối Khâm",
      "required_components": {
        "groups": ["MAIN_TOP", "INNER", "BOTTOM", "FOOTWEAR"]
      },
      "optional_components": {
        "groups": ["ACCESSORIES"],
        "recommended_items": ["V03", "cs_12", "cs_27", "cs_11_1", "cs_11_2", "j05", "j19", "cs_04", "cs_20"]
      }
    }
  ],
  "criteria_weights": {
    "cultural": 30,
    "event": 25,
    "item_compatibility": 20,
    "color": 15,
    "completeness": 10
  }
};
