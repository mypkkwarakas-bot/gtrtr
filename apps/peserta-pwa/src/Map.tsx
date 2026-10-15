import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { FleetMapRow, TrackingStatus } from './lib/types';
import { formatAge } from './lib/dates';

export interface MapFleet extends FleetMapRow { liveStatus: TrackingStatus; liveAge: number | null }
export interface Dest { name: string | null; lat: number; lng: number }

const COLOR: Record<TrackingStatus, string> = {
  fresh: '#1D7F52', late: '#9A6410', stale: '#B3261E', trip_ended: '#5F6670', no_location: '#5F6670',
};

function fleetIcon(f: MapFleet, mine: boolean): L.DivIcon {
  const el = document.createElement('div');
  el.className = `pin${mine ? ' mine' : ''}${f.liveStatus === 'stale' ? ' dim' : ''}`;
  el.style.setProperty('--pin', COLOR[f.liveStatus]);
  const dot = document.createElement('span');
  dot.className = 'pin-dot';
  const label = document.createElement('span');
  label.className = 'pin-label';
  label.textContent = f.fleet_name; // textContent: nama dari database tidak pernah diperlakukan sebagai HTML
  el.append(dot, label);
  return L.divIcon({ html: el, className: 'pin-wrap', iconSize: [20, 20], iconAnchor: [10, 10] });
}

function destIcon(): L.DivIcon {
  const el = document.createElement('div');
  el.className = 'pin dest';
  const dot = document.createElement('span');
  dot.className = 'pin-dot';
  dot.textContent = '★';
  el.append(dot);
  return L.divIcon({ html: el, className: 'pin-wrap', iconSize: [24, 24], iconAnchor: [12, 12] });
}

function popupFor(f: MapFleet): HTMLElement {
  const box = document.createElement('div');
  const t = document.createElement('strong'); t.textContent = f.fleet_name;
  const s = document.createElement('div'); s.textContent = `Diperbarui ${formatAge(f.liveAge)}`;
  box.append(t, s);
  return box;
}

export function FleetMap({ fleets, destination, myFleetId }: { fleets: MapFleet[]; destination: Dest | null; myFleetId: string | null }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const fitted = useRef(false);

  useEffect(() => {
    if (!host.current || map.current) return;
    map.current = L.map(host.current, { zoomControl: true, attributionControl: true }).setView([-6.12, 106.85], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; layer.current = null; fitted.current = false; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const pts: L.LatLngTuple[] = [];
    for (const f of fleets) {
      if (f.latitude === null || f.longitude === null) continue;
      const ll: L.LatLngTuple = [f.latitude, f.longitude];
      pts.push(ll);
      L.marker(ll, { icon: fleetIcon(f, f.fleet_id === myFleetId), title: f.fleet_name }).bindPopup(popupFor(f)).addTo(g);
    }
    if (destination) {
      const ll: L.LatLngTuple = [destination.lat, destination.lng];
      pts.push(ll);
      const pop = document.createElement('strong');
      pop.textContent = destination.name ?? 'Destinasi';
      L.marker(ll, { icon: destIcon(), title: destination.name ?? 'Destinasi' }).bindPopup(pop).addTo(g);
    }
    if (!fitted.current && pts.length) {
      fitted.current = true;
      if (pts.length === 1) m.setView(pts[0], 15);
      else m.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 16 });
    }
  }, [fleets, destination, myFleetId]);

  return <div ref={host} className="map" role="region" aria-label="Peta posisi armada dan destinasi" />;
}
