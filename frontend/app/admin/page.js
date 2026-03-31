'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '../../components/Api';

export default function AdminPage() {
  const [data, setData] = useState({ lost_count: 0, found_count: 0, active_missing_count: 0, volunteer_count: 0, shelter_scan_count: 0, social_ingest_count: 0, latest_matches: [] });

  useEffect(() => {
    fetchJson('/api/admin/overview').then(setData).catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="grid grid-3">
          <div className="card"><div className="kpi">{data.lost_count}</div><div className="muted">Lost reports</div></div>
          <div className="card"><div className="kpi">{data.found_count}</div><div className="muted">Found reports</div></div>
          <div className="card"><div className="kpi">{data.active_missing_count}</div><div className="muted">Active reports</div></div>
          <div className="card"><div className="kpi">{data.volunteer_count}</div><div className="muted">Volunteers</div></div>
          <div className="card"><div className="kpi">{data.shelter_scan_count}</div><div className="muted">Shelter scans</div></div>
          <div className="card"><div className="kpi">{data.social_ingest_count}</div><div className="muted">Social ingests</div></div>
        </div>

        <div className="card big-card" style={{ marginTop: 24 }}>
          <h1>Admin overview</h1>
          <p className="muted">Recent active cases from the system.</p>
          <div className="grid" style={{ marginTop: 20 }}>
            {data.latest_matches.map((item) => (
              <div className="match" key={item.lost_pet_id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={item.image_url} alt={item.name} className="thumb" />
                  <div>
                    <strong>{item.name}</strong>
                    <div className="small">{item.animal_type} • {item.city}</div>
                    <div className="small">{item.reason}</div>
                    {item.tag_overlap?.length ? <div className="small">Tags: {item.tag_overlap.join(', ')}</div> : null}
                  </div>
                </div>
                <div className="score">Live</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
