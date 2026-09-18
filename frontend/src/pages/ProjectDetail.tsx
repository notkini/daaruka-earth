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

  /*
   * Load project and sites
   */
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

    loadProject();
  }, [projectId]);

  /*
   * Initialize Mapbox
   */
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

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right",
    );

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

  /*
   * Display saved site polygons
   */
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
          "fill-opacity": 0.35,
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

  /*
   * Escape:
   *
   * Exit drawing mode but keep the draft.
   * The New Site panel remains visible so the user
   * can still save the polygon.
   */
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

      /*
       * Leave drawing mode but DO NOT delete anything.
       */
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

  /*
   * Start or resume drawing
   */
  function startDrawing() {
    const draw = drawRef.current;

    if (!draw || !mapReady) {
      setError("The map is still loading. Please wait.");
      return;
    }

    setError("");
    setDrawing(true);

    /*
     * If there is already a draft, don't delete it.
     */
    draw.changeMode("draw_polygon");
  }

  /*
   * Cancel the current draft completely
   */
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

  /*
   * Save the current polygon
   */
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
      setError(
        "Add at least 3 points and close the polygon before saving.",
      );
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

      setSites((currentSites) => [
        response.data,
        ...currentSites,
      ]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f4]">
        <p className="text-gray-500">
          Loading project...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f4]">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#17351f]">
            Project not found
          </h1>

          <Link
            to="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-[#39734a]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <header className="border-b border-[#dfe6e0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-[#39734a]"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-2 text-xl font-semibold text-[#17351f]">
              {project.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {project.description ||
              "No project description provided."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-[#dfe6e0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e5ebe6] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#17351f]">
                  Project map
                </h2>

                <p className="text-sm text-gray-500">
                  View and draw geographic sites.
                </p>
              </div>

              {!drawing && (
                <button
                  type="button"
                  onClick={startDrawing}
                  disabled={!mapReady}
                  className="relative z-30 rounded-lg bg-[#17351f] px-4 py-2 text-sm font-medium text-white hover:bg-[#24512f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mapReady
                    ? hasDraft
                      ? "Resume drawing"
                      : "Add site"
                    : "Loading map..."}
                </button>
              )}
            </div>

            <div
              className="relative w-full"
              style={{ height: "620px" }}
            >
              <div
                ref={mapContainerRef}
                className="absolute inset-0"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </section>

          <aside className="space-y-6">
            {(drawing || hasDraft) && (
              <section className="rounded-2xl border border-[#dfe6e0] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#17351f]">
                      New site
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {drawing
                        ? "Click points on the map to create your polygon."
                        : "Your current polygon is preserved. Resume drawing or save it."}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-medium text-[#39734a]">
                    {drawing ? "Drawing" : "Draft"}
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-[#f5f7f4] px-3 py-2.5 text-xs leading-5 text-gray-600">
                  Add at least 3 points. Click the first
                  point again to close the polygon.
                  Press Escape to pause drawing.
                </div>

                <input
                  type="text"
                  value={siteName}
                  onChange={(event) =>
                    setSiteName(event.target.value)
                  }
                  placeholder="Site name"
                  className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#39734a] focus:ring-2 focus:ring-[#39734a]/20"
                />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={cancelDrawing}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveSite}
                    className="rounded-lg bg-[#39734a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f603e]"
                  >
                    Save site
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[#dfe6e0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#17351f]">
                  Sites
                </h3>

                <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-medium text-[#39734a]">
                  {sites.length}
                </span>
              </div>

              {sites.length === 0 ? (
                <p className="mt-5 text-sm leading-6 text-gray-500">
                  No sites have been added to this project yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() =>
                        navigate(`/sites/${site.id}`)
                      }
                      className="w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#39734a]"
                    >
                      <p className="font-medium text-[#17351f]">
                        {site.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Site #{site.id}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ProjectDetail;

