"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Map as LeafletMap } from "leaflet";

const REGION_GEO: Record<string, [number, number]> = {
  "서울 강남구": [37.5172, 127.0473],
  "서울 강북구": [37.6396, 127.0257],
  "서울 강서구": [37.5509, 126.8495],
  "서울 마포구": [37.5663, 126.9018],
  "서울 서초구": [37.4836, 127.0327],
  "서울 송파구": [37.5145, 127.1059],
  "서울 영등포구": [37.5264, 126.8962],
  "서울 용산구": [37.5326, 126.9905],
  "서울 종로구": [37.5734, 126.9788],
  "경기 성남시": [37.4449, 127.1389],
  "경기 수원시": [37.2636, 127.0286],
  "경기 고양시": [37.6584, 126.832],
  "경기 용인시": [37.2411, 127.1776],
  "인천 연수구": [37.4108, 126.6783],
  "부산 해운대구": [35.1631, 129.1635],
};

export function NearbyMap({
  counts,
  activeRegion,
}: {
  counts: { region: string; count: number }[];
  activeRegion?: string | null;
}) {
  const router = useRouter();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current) return;

      let center: [number, number] = [37.55, 127.0];
      let zoom = 11;
      if (activeRegion && REGION_GEO[activeRegion]) {
        center = REGION_GEO[activeRegion];
        zoom = 13;
      } else if (counts.length > 0) {
        const valid = counts.filter((c) => REGION_GEO[c.region]);
        if (valid.length > 0) {
          const avgLat =
            valid.reduce((s, c) => s + REGION_GEO[c.region][0], 0) / valid.length;
          const avgLng =
            valid.reduce((s, c) => s + REGION_GEO[c.region][1], 0) / valid.length;
          center = [avgLat, avgLng];
        }
      }

      const map = L.map(elRef.current, { scrollWheelZoom: false }).setView(
        center,
        zoom
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      counts.forEach(({ region, count }) => {
        const geo = REGION_GEO[region];
        if (!geo) return;
        const isActive = region === activeRegion;
        const size = Math.min(56, 28 + count * 4);
        const html = `
          <div class="ygn-pin ${isActive ? "ygn-pin-active" : ""}"
               style="width:${size}px;height:${size}px;line-height:${size - 4}px">
            <div class="ygn-pin-num">${count}</div>
            <div class="ygn-pin-label">${region.split(" ").pop()}</div>
          </div>`;
        const icon = L.divIcon({
          html,
          className: "ygn-pin-wrap",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const marker = L.marker(geo, { icon }).addTo(map);
        marker.on("click", () => {
          router.push(`/campaigns?region=${encodeURIComponent(region)}`);
        });
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [counts, activeRegion, router]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-sm font-bold">
          📍 지도로 보기
          <span className="text-xs font-normal text-ink-500">
            · 핀을 클릭하면 해당 지역 캠페인을 볼 수 있어요
          </span>
        </div>
        <div className="text-[11px] text-ink-500">
          전체 {counts.reduce((s, c) => s + c.count, 0)}개
        </div>
      </div>
      <div ref={elRef} className="h-72 w-full bg-ink-100" />
    </div>
  );
}
