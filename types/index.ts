// 공공데이터포털 API 응답 타입 정의

export interface Hospital {
  org_nm: string; // 기관명
  org_cd: string; // 기관코드
  si: string; // 시도
  gun: string; // 시군구
}

export interface NonCoveredItem {
  apc_nm: string; // 비급여 진료 항목명
  apc_cd: string; // 비급여 진료 항목 코드
  med_rnk_unit?: string; // 조제 단위
  med_rnk_cnt?: number; // 조제 횟수
  reci_clsf_cd?: string; // 처방 분류 코드
  price?: string | number; // 금액
  rpt_ym?: string; // 보고 년월
  org_cd: string; // 기관 코드
  org_nm: string; // 기관명
}

export interface HospitalApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: Hospital[] | NonCoveredItem[];
      totalCount?: number;
    };
  };
}

export interface ComparisonResult {
  item_name: string; // 비교 항목명
  item_code: string; // 항목 코드
  hospitals: {
    name: string;
    price: number | string;
    unit?: string;
  }[];
  price_difference?: number; // 가격 차이
  price_difference_percentage?: number; // 가격 차이 비율
}

export interface ComparisonInput {
  hospital_codes: string[];
  hospital_names: string[];
}

// 유사도 계산을 위한 타입
export interface SimilarityMatch {
  similarity: number;
  matched_item: NonCoveredItem;
  original_item: NonCoveredItem;
}


