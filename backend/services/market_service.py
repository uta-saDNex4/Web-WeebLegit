"""Service layer for comparing contract terms (e.g., rent, deposit) against market reference data."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from uuid import UUID

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"

_market_samples_cache: dict[str, Any] | None = None


def _load_market_samples() -> dict[str, Any]:
    global _market_samples_cache
    if _market_samples_cache is None:
        sample_file = DATA_DIR / "apartment_price_samples.json"
        if sample_file.is_file():
            try:
                with sample_file.open("r", encoding="utf-8") as f:
                    _market_samples_cache = json.load(f)
            except Exception:
                _market_samples_cache = {}
        else:
            _market_samples_cache = {}
    return _market_samples_cache


def _normalize_district_query(district_str: str) -> str:
    """Normalize user district input (e.g. 'q12', 'q.12', 'Q 12', 'quận 12') to standard string."""
    d = district_str.strip().lower()
    # Match patterns like q12, q.12, q 12
    m = re.match(r"^q\.?\s*(\d+)$", d)
    if m:
        return f"quận {m.group(1)}"
    return d


class MarketService:
    def compare_rent_price(
        self,
        contract_id: UUID,
        contract_type: str | None,
        district: str | None,
        base_rent: float | None,
        area_m2: float | None = None,
    ) -> dict[str, Any]:
        """Compare rental pricing against local market averages."""
        recommendations: list[str] = []
        data = _load_market_samples()
        districts_data = data.get("district_summary", [])

        if not base_rent or base_rent <= 0:
            return {
                "contract_id": contract_id,
                "contract_type": contract_type,
                "district": district,
                "price_evaluation": "Giá thuê không hợp lệ hoặc thiếu thông tin để đối chiếu.",
                "price_difference_percent": None,
                "market_average": None,
                "recommendations": [
                    "Vui lòng nhập số tiền giá thuê lớn hơn 0 (VNĐ) để tiến hành so sánh với thị trường."
                ],
            }

        matched_district = None
        if district:
            norm_query = _normalize_district_query(district)
            for d in districts_data:
                d_name = d.get("district", "").lower()
                norm_d_name = _normalize_district_query(d_name)
                if norm_query in norm_d_name or norm_d_name in norm_query:
                    matched_district = d
                    break

        if matched_district and matched_district.get("average_price_vnd"):
            avg_price = float(matched_district["average_price_vnd"])
            min_p = float(matched_district.get("price_range_vnd", {}).get("min", 0))
            max_p = float(matched_district.get("price_range_vnd", {}).get("max", 0))

            price_eval = f"Giá thuê đối chiếu tại {matched_district['district']}: {base_rent:,.0f} VNĐ."
            recommendations.append(
                f"Khu vực {matched_district['district']} có khoảng giá mua/thuê tham khảo từ {min_p:,.0f} đến {max_p:,.0f} VNĐ."
            )

            # Standard threshold checks for student rental benchmarks
            if base_rent > 8000000 and "trọ" in (contract_type or "").lower():
                recommendations.append(
                    "Giá thuê trọ cao hơn trung bình phân khúc sinh viên (thường 2 - 5 triệu). Cần rà soát phí dịch vụ đi kèm (điện, nước, quản lý)."
                )
                price_eval += " Mức giá tương đối cao đối với phân khúc phòng trọ sinh viên."
            elif base_rent < 2000000 and "trọ" in (contract_type or "").lower():
                recommendations.append(
                    "Giá thuê trọ khá rẻ so với mặt bằng chung. Hãy kiểm tra kĩ tình trạng phòng, an ninh và hợp đồng cọc."
                )
                price_eval += " Mức giá hợp lý / ưu đãi."
            else:
                price_eval += " Mức giá nằm trong khoảng phổ biến."

            return {
                "contract_id": contract_id,
                "contract_type": contract_type,
                "district": matched_district["district"],
                "price_evaluation": price_eval,
                "price_difference_percent": 0.0,
                "market_average": avg_price,
                "recommendations": recommendations,
            }

        return {
            "contract_id": contract_id,
            "contract_type": contract_type,
            "district": district,
            "price_evaluation": f"Mức giá thuê ghi nhận: {base_rent:,.0f} VNĐ. Chưa có đủ dữ liệu tham chiếu khu vực cụ thể.",
            "price_difference_percent": None,
            "market_average": None,
            "recommendations": [
                "Khuyên dùng: Tham khảo thêm giá thuê phòng cùng diện tích trên các trang Nhà Tốt, Chợ Tốt tại địa bàn sinh sống."
            ],
        }
