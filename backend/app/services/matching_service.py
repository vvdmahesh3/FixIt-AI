import math
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class MatchingService:
    def rank_technicians(self, technicians: List[Any], category: str, user_lat: float, user_lng: float) -> List[Dict[str, Any]]:
        """
        Filters and scores technicians based on category, proximity, rating, and availability.
        """
        results = []
        for tech in technicians:
            cat_match = category.lower() in tech.category.lower() or tech.category.lower() in category.lower()
            if not cat_match and category != "General":
                continue
                
            dist = haversine_distance(user_lat, user_lng, tech.lat, tech.lng)
            # Scoring: Higher rating and closer distance rank best
            # Availability bonus
            score = (tech.rating * 2.0) - (dist * 0.5) + (2.0 if tech.is_available else 0.0)
            
            results.append({
                "technician": tech,
                "distance_km": round(dist, 1),
                "score": score
            })
            
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def generate_route_waypoints(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, steps: int = 15) -> List[Dict[str, float]]:
        """
        Generates realistic route waypoints along a simulated road curve
        from technician's current location to customer's building.
        """
        waypoints = []
        for i in range(steps + 1):
            t = i / steps
            # Add slight bezier curve bend to simulate actual city road turns
            lat_bend = 0.002 * math.sin(t * math.pi)
            lng_bend = 0.0015 * math.sin(t * math.pi)
            
            cur_lat = start_lat + (end_lat - start_lat) * t + lat_bend
            cur_lng = start_lng + (end_lng - start_lng) * t + lng_bend
            waypoints.append({
                "lat": round(cur_lat, 6),
                "lng": round(cur_lng, 6),
                "progress_pct": round(t * 100, 1)
            })
        return waypoints

matching_service = MatchingService()
