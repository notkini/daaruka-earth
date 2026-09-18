import { useEffect, useRef, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import api from "../services/api";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

type Project = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
};

type Site = {
  id: number;
  project_id: number;
  name: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  created_at: string;
};

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const [drawing, setDrawing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const [projectResponse, sitesResponse] = await Promise.all([
          api.get<Project>(`/api/projects/${projectId}`),
          api.get<Site[]>(`/api/projects/${projectId}/sites`),
        ]);

        setProject(projectResponse.data);
        setSites(sitesResponse.data);
      } catch (requestError) {
        console.error("Project loading error:", requestError);
        setError("Unable to load project.");
      } finally {
        setLoading(false);
      }
    }

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!mapContainerRef.current) {
      setError("Map container could not be created.");
      return;
    }

    if (!MAPBOX_TOKEN) {
      setError(
        "Mapbox token is missing. Add VITE_MAPBOX_TOKEN to frontend/.env.",
      );
      return;
    }

    if (mapRef.current) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 20.5937],
      zoom: 4.5,
      attributionControl: true,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(draw, "top-left");

    map.on("load", () => {
      mapRef.current = map;
      drawRef.current = draw;

      setTimeout(() => {
        map.resize();
      }, 100);

      setMapReady(true);
    });

    map.on("draw.create", () => {
      setHasDraft(true);
      setError("");
    });

    map.on("draw.update", () => {
      setHasDraft(true);
      setError("");
    });

    map.on("draw.delete", () => {
      setHasDraft(false);
    });

    map.on("error", (event) => {
      console.error("MAPBOX ERROR:", event);
      setError("Mapbox rendering error. Check the browser console.");
    });

    return () => {
      drawRef.current = null;
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, [loading]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) {
      return;
    }

    const sourceData = {
      type: "FeatureCollection" as const,
      features: sites.map((site) => ({
        type: "Feature" as const,
        properties: {
          siteId: site.id,
          name: site.name,
        },
        geometry: site.geometry,
      })),
    };

    const updateSource = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      const existingSource = map.getSource(
        "sites",
      ) as mapboxgl.GeoJSONSource | undefined;

      if (existingSource) {
        existingSource.setData(sourceData);
        return;
      }

      map.addSource("sites", {
        type: "geojson",
        data: sourceData,
      });

      map.addLayer({
        id: "site-polygons",
        type: "fill",
        source: "sites",
        paint: {
          "fill-color": "#39734a",
          "fill-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "site-outlines",
        type: "line",
        source: "sites",
        paint: {
          "line-color": "#17351f",
          "line-width": 2,
        },
      });

      map.on("click", "site-polygons", (event) => {
        const feature = event.features?.[0];

        if (!feature) {
          return;
        }

        const siteId = feature.properties?.siteId;

        if (siteId) {
          navigate(`/sites/${siteId}`);
        }
      });

      map.on("mouseenter", "site-polygons", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "site-polygons", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [mapReady, sites, navigate]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      const draw = drawRef.current;

      if (!draw) {
        return;
      }

      const collection = draw.getAll();

      if (collection.features.length === 0) {
        return;
      }

      event.preventDefault();

      draw.changeMode("simple_select");

      setHasDraft(true);
      setDrawing(false);
      setError("");
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function startDrawing() {
    const draw = drawRef.current;

    if (!draw || !mapReady) {
      setError("The map is still loading. Please wait.");
      return;
    }

    setError("");
    setDrawing(true);
    draw.changeMode("draw_polygon");
  }

  function cancelDrawing() {
    const draw = drawRef.current;

    if (draw) {
      draw.deleteAll();
      draw.changeMode("simple_select");
    }

    setDrawing(false);
    setHasDraft(false);
    setSiteName("");
    setError("");
  }

  async function saveSite() {
    const draw = drawRef.current;

    if (!draw || !projectId) {
      setError("Map drawing is not available.");
      return;
    }

    if (!siteName.trim()) {
      setError("Enter a site name.");
      return;
    }

    const collection = draw.getAll();

    if (collection.features.length === 0) {
      setError("Draw a polygon on the map first.");
      return;
    }

    const feature = collection.features[0];

    if (feature.geometry.type !== "Polygon") {
      setError("Please finish the polygon before saving.");
      return;
    }

    const coordinates = feature.geometry.coordinates[0];

    if (coordinates.length < 4) {
      setError("Add at least 3 points and close the polygon before saving.");
      return;
    }

    try {
      const response = await api.post<Site>(
        `/api/projects/${projectId}/sites`,
        {
          name: siteName.trim(),
          geometry: feature.geometry,
        },
      );

      setSites((currentSites) => [response.data, ...currentSites]);

      draw.deleteAll();
      draw.changeMode("simple_select");

      setDrawing(false);
      setHasDraft(false);
      setSiteName("");
      setError("");
    } catch (requestError) {
      console.error("Site creation error:", requestError);
      setError("Unable to create site.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f3]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17351f] text-xl font-bold text-white">
              D
            </div>
            <p className="mt-4 text-sm font-medium text-[#17351f]">
              Loading project...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Preparing your project workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f3] px-6">
        <div className="max-w-md rounded-3xl border border-[#dfe7e0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#17351f]">
            Project not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            We couldn't find the project you're looking for.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24512f]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#17351f]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#dfe7e0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#39734a] transition hover:text-[#17351f]"
            >
              <span>←</span>
              Dashboard
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {project.name}
              </h1>

              <span className="hidden rounded-full border border-[#dce8de] bg-[#f5faf6] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#39734a] sm:inline-flex">
                Project
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="hidden rounded-xl border border-[#d5ded6] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:block"
          >
            All projects
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 sm:py-8">
        {/* Project overview */}
        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
              Project workspace
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#dfe7e0] bg-white px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5ef] text-sm font-bold text-[#39734a]">
              {sites.length}
            </div>

            <div>
              <p className="text-xs text-gray-400">Mapped sites</p>
              <p className="text-sm font-semibold text-[#17351f]">
                {sites.length === 1 ? "1 site" : `${sites.length} sites`}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Main workspace */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Map */}
          <section className="overflow-hidden rounded-3xl border border-[#dfe7e0] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e7ece7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">
                    Geographic map
                  </h2>

                  <span
                    className={`h-2 w-2 rounded-full ${
                      mapReady ? "bg-[#39734a]" : "animate-pulse bg-gray-300"
                    }`}
                  />
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Draw site boundaries and explore mapped areas.
                </p>
              </div>

              {!drawing && (
                <button
                  type="button"
                  onClick={startDrawing}
                  disabled={!mapReady}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-base">{hasDraft ? "↻" : "+"}</span>
                  {mapReady
                    ? hasDraft
                      ? "Resume drawing"
                      : "Add site"
                    : "Loading map..."}
                </button>
              )}
            </div>

            <div className="relative h-[520px] w-full sm:h-[620px]">
              <div
                ref={mapContainerRef}
                className="absolute inset-0"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />

              {!mapReady && !error && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/20">
                  <div className="rounded-xl border border-white/60 bg-white/90 px-4 py-3 text-sm font-medium text-gray-600 shadow-lg backdrop-blur">
                    Loading map...
                  </div>
                </div>
              )}

              {drawing && (
                <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs rounded-xl border border-white/60 bg-[#17351f]/95 px-4 py-3 text-white shadow-lg backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#b9d7bd]">
                    Drawing mode
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    Click points on the map
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#c9d9cc]">
                    Add at least 3 points and click the first point to close
                    the polygon.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Drawing panel */}
            {(drawing || hasDraft) && (
              <section className="rounded-2xl border border-[#d8e2d9] bg-white shadow-sm">
                <div className="border-b border-[#e7ece7] px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#39734a]">
                        Site builder
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        {drawing ? "Draw a new site" : "Site draft"}
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#eef5ef] px-3 py-1 text-[11px] font-bold text-[#39734a]">
                      {drawing ? "DRAWING" : "DRAFT"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-xl bg-[#f5f8f5] p-4">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#dfece1] text-xs font-bold text-[#39734a]">
                        i
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#17351f]">
                          How to map a site
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Click at least 3 points on the map, then click the
                          first point to close the polygon. Press Escape to
                          pause without losing your draft.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="site-name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Site name
                    </label>

                    <input
                      id="site-name"
                      type="text"
                      value={siteName}
                      onChange={(event) => setSiteName(event.target.value)}
                      placeholder="Western Ghats — Zone A"
                      className="w-full rounded-xl border border-[#d5ded6] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#39734a] focus:ring-4 focus:ring-[#39734a]/10"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={cancelDrawing}
                      className="rounded-xl border border-[#d5ded6] px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveSite}
                      className="rounded-xl bg-[#39734a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f603e]"
                    >
                      Save site
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Sites list */}
            <section className="rounded-2xl border border-[#dfe7e0] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e7ece7] px-5 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#39734a]">
                    Geographic data
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Project sites
                  </h3>
                </div>

                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#17351f] px-2.5 text-xs font-bold text-white">
                  {sites.length}
                </span>
              </div>

              <div className="p-4">
                {sites.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#cbd8cd] bg-[#fafcf9] px-5 py-8 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef5ef] text-lg text-[#39734a]">
                      +
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#17351f]">
                      No sites mapped
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Add a geographic boundary to start analysing
                      biodiversity data.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sites.map((site, index) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => navigate(`/sites/${site.id}`)}
                        className="group w-full rounded-xl border border-[#e2e9e3] p-4 text-left transition hover:border-[#b9cdbb] hover:bg-[#f8fbf8]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef5ef] text-xs font-bold text-[#39734a]">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#17351f]">
                              {site.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Site #{site.id}
                            </p>
                          </div>

                          <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#39734a]">
                            →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Analytics hint */}
            <div className="rounded-2xl bg-[#17351f] p-5 text-white shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm">
                ↗
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Explore site intelligence
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#c9d9cc]">
                Select any mapped site to view biodiversity observations and
                environmental analytics.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ProjectDetail;