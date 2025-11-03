import React, { useEffect, useRef, useState } from "react";

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  apiKey?: string;
  initialLocation?: Location;
  onSelect: (loc: Location) => void;
  selectedLocation?: Location | null;
  deliveryFee?: number;
};

// Lightweight MapPicker using Geoapify Maps API. Requires API key provided
// via props (or NEXT_PUBLIC_GEOAPIFY_API_KEY externally). It provides
// a search box (Geocoding API) and allows clicking the map to place a marker.
export default function DeliveryMapPicker({
  apiKey,
  initialLocation,
  onSelect,
  selectedLocation,
  deliveryFee,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Use provided apiKey or fall back to environment variable
  const effectiveApiKey = apiKey || process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  useEffect(() => {
    if (!effectiveApiKey) {
      setError(
        "Geoapify API key not provided. Set NEXT_PUBLIC_GEOAPIFY_API_KEY."
      );
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
      document.head.appendChild(leafletCSS);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if ((window as any).L) {
          resolve((window as any).L);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
        script.onload = () => resolve((window as any).L);
        script.onerror = () => setError("Failed to load Leaflet.");
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L: any) => {
      if (!mapRef.current || !L) return;

      const center = initialLocation ?? { lat: 7.0603, lng: 125.6196 };

      // Create map
      const map = L.map(mapRef.current).setView([center.lat, center.lng], 14);
      mapInstanceRef.current = map;

      // Add Geoapify tile layer
      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${effectiveApiKey}`,
        {
          attribution: "© OpenMapTiles © OpenStreetMap contributors",
        }
      ).addTo(map);

      // Add marker
      markerRef.current = L.marker([center.lat, center.lng], {
        draggable: true,
      }).addTo(map);

      // Reverse geocoding function
      const reverseGeocode = async (lat: number, lng: number) => {
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${effectiveApiKey}`
          );
          const data = await response.json();
          const address = data.features?.[0]?.properties?.formatted || "";
          onSelect({ lat, lng, address });
        } catch (error) {
          onSelect({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      };

      // Handle marker drag
      markerRef.current.on("dragend", function (e: any) {
        const { lat, lng } = e.target.getLatLng();
        reverseGeocode(lat, lng);
      });

      // Handle map click
      map.on("click", function (e: any) {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // If initial location provided, call onSelect
      if (initialLocation) {
        onSelect(initialLocation);
      } else {
        reverseGeocode(center.lat, center.lng);
      }

      setReady(true);
    });
  }, [effectiveApiKey, initialLocation, onSelect]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current)
          mapInstanceRef.current.setView([lat, lng], 16);

        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${effectiveApiKey}`
          );
          const data = await response.json();
          const address =
            data.features?.[0]?.properties?.formatted ||
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onSelect({ lat, lng, address });
        } catch (error) {
          onSelect({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      },
      (err) => setError(err.message)
    );
  };

  return (
    <div className="space-y-2">
      {!effectiveApiKey ? (
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200 text-sm text-yellow-800">
          Geoapify API key not set. Get a free API key at{" "}
          <a
            href="https://www.geoapify.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            geoapify.com
          </a>{" "}
          and set `NEXT_PUBLIC_GEOAPIFY_API_KEY`.
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 rounded border border-red-200 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={useMyLocation}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
            >
              Use my location
            </button>
            <span className="text-sm text-gray-600 flex items-center">
              Click on the map to set your delivery location
            </span>
          </div>
          <div
            ref={mapRef}
            style={{ height: 320, width: "100%" }}
            className="rounded overflow-hidden border"
          />

          {selectedLocation && (
            <div className="mt-2 p-3 bg-blue-50 border rounded text-sm flex items-start gap-2">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div className="flex-row">
                <p className="text-sm font-medium text-blue-900">
                  Delivery Fee Calculation
                </p>
                <div className="mt-2">
                  <div className="">
                    <strong className="mr-2">Selected:</strong>
                    {selectedLocation.address ||
                      `${selectedLocation.lat.toFixed(
                        6
                      )}, ${selectedLocation.lng.toFixed(6)}`}
                  </div>
                  {deliveryFee !== undefined && (
                    <div className="text-sm text-gray-700">
                      <span>
                        Delivery fee: <strong>₱{deliveryFee}</strong>
                      </span>
                    </div>
                  )}{" "}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
