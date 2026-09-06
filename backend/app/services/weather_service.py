from typing import Optional, Dict, Any
import datetime
import httpx
from app.core.config import settings
from app.core.logging import logger


class WeatherService:
    WMO_CODES = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }

    @classmethod
    async def get_weather(cls, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Retrieves real-time weather metrics using Open-Meteo or fallback.
        Never crashes; returns weather_available=False if network fails.
        """
        if settings.WEATHER_PROVIDER == "open-meteo":
            try:
                params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,precipitation,weather_code,wind_speed_10m",
                }
                async with httpx.AsyncClient(timeout=3.5) as client:
                    resp = await client.get(settings.WEATHER_API_URL, params=params)
                    if resp.status_code == 200:
                        data = resp.json().get("current", {})
                        wmo = data.get("weather_code", 0)
                        condition = cls.WMO_CODES.get(wmo, "Normal")
                        return {
                            "weather_available": True,
                            "weather_condition": condition,
                            "temperature_celsius": float(data.get("temperature_2m", 25.0)),
                            "precipitation_mm": float(data.get("precipitation", 0.0)),
                            "wind_speed_kmh": float(data.get("wind_speed_10m", 5.0)),
                        }
            except Exception as e:
                logger.warning(f"Open-Meteo weather fetch failed for ({latitude}, {longitude}): {e}")

        # Fallback when offline or mock provider
        return {
            "weather_available": False,
            "weather_condition": None,
            "temperature_celsius": None,
            "precipitation_mm": None,
            "wind_speed_kmh": None,
        }
