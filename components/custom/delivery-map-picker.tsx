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
};

// Lightweight MapPicker using Google Maps JS API. Requires API key provided
// via props (or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY externally). It provides
// a search box (Places Autocomplete) and allows clicking the map to place a marker.
export default function DeliveryMapPicker({ apiKey, initialLocation, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key not provided. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }

    // load script if not loaded
    const existing = (window as any).google;
    const callbackName = `__gmaps_cb_${Math.random().toString(36).slice(2)}`;

    const init = () => {
      const google = (window as any).google;
      if (!google) return setError("Google API failed to load.");

      const center = initialLocation ?? { lat: 7.0603, lng: 125.6196 };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
      });
      mapInstanceRef.current = map;

      // marker
      markerRef.current = new google.maps.Marker({
        map,
        position: center,
        draggable: true,
      });

      const geocoder = new google.maps.Geocoder();

      // on marker drag end
      google.maps.event.addListener(markerRef.current, "dragend", function () {
        const pos = markerRef.current.getPosition();
        if (!pos) return;
        const lat = pos.lat();
        const lng = pos.lng();
        geocoder.geocode({ location: { lat, lng } }, function (results: any) {
          const address = results && results[0] ? results[0].formatted_address : "";
          onSelect({ lat, lng, address });
        });
      });

      // click to place marker
      map.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        markerRef.current.setPosition(e.latLng);
        geocoder.geocode({ location: { lat, lng } }, function (results: any) {
          const address = results && results[0] ? results[0].formatted_address : "";
          onSelect({ lat, lng, address });
        });
      });

      // Places Autocomplete on search box
      if (searchRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
          fields: ["geometry", "formatted_address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";
          map.panTo({ lat, lng });
          markerRef.current.setPosition({ lat, lng });
          onSelect({ lat, lng, address });
        });
      }

      // If initial location provided, call onSelect
      if (initialLocation) {
        onSelect(initialLocation);
      } else {
        onSelect(center);
      }

      setReady(true);
    };

    if (existing && existing.maps && existing.places) {
      init();
    } else {
      // create script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
      script.async = true;
      (window as any)[callbackName] = () => {
        init();
      };
      script.onerror = () => setError("Failed to load Google Maps script.");
      document.head.appendChild(script);
      return () => {
        try {
          document.head.removeChild(script);
          delete (window as any)[callbackName];
        } catch (e) {}
      };
    }
  }, [apiKey, initialLocation, onSelect]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const google = (window as any).google;
        if (markerRef.current) markerRef.current.setPosition({ lat, lng });
        if (mapInstanceRef.current) mapInstanceRef.current.panTo({ lat, lng });
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, function (results: any) {
          const address = results && results[0] ? results[0].formatted_address : "";
          onSelect({ lat, lng, address });
        });
      },
      (err) => setError(err.message)
    );
  };

  return (
    <div className="space-y-2">
      {!apiKey ? (
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200 text-sm text-yellow-800">Google Maps API key not set. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable inline map picker.</div>
      ) : error ? (
        <div className="p-3 bg-red-50 rounded border border-red-200 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="flex gap-2">
            <input ref={searchRef} placeholder="Search address or landmark" className="w-full px-3 py-2 border rounded" />
            <button type="button" onClick={useMyLocation} className="px-3 py-2 bg-gray-100 rounded">Use my location</button>
          </div>
          <div ref={mapRef} style={{ height: 320, width: "100%" }} className="rounded overflow-hidden border" />
        </>
      )}
    </div>
  );
}
