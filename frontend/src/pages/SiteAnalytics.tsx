import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

type Species = {
  name: string;
  records: number;
};

type YearObservation = {
  year: number;
  records: number;
};

type TaxonomicComposition = {
  kingdom: string;
  records: number;
};

type RecordSource = {
  type: string;
  records: number;
};

type GBIFAnalytics = {
  total_occurrences: number;
  species_richness: number;
  records_processed: number;
  records_available_for_query: number;
  sampling_limit: number;
  top_species: Species[];
  observations_by_year: YearObservation[];
  taxonomic_composition: TaxonomicComposition[];
  record_sources: RecordSource[];
};

type ExternalAnalytics = {
  site_id: number;
  site_name: string;
  sources: {
    gbif: {
      name: string;
      url: string;
    };
  };
  biodiversity: GBIFAnalytics;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function SiteAnalytics() {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<ExternalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ExternalAnalytics>(
          `/api/sites/${siteId}/analytics`,
        );

        setAnalytics(response.data);
      } catch (err: any) {
        console.error("Analytics error:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load site analytics.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      void loadAnalytics();
    }
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f3]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-[#dce6dd]" />
            <div className="mt-5 h-10 w-72 rounded bg-[#dce6dd]" />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="mt-6 h-24 rounded-2xl bg-white shadow-sm" />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[410px] rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f3] px-5">
        <div className="w-full max-w-md rounded-3xl border border-[#dfe7e0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
            !
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[#17351f]">
            Unable to load analytics
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "No analytics available for this site."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24512f]"
          >
            Back to project
          </button>
        </div>
      </div>
    );
  }

  const biodiversity = analytics.biodiversity;

  const observationChart = {
    labels: biodiversity.observations_by_year.map((item) => item.year),
    datasets: [
      {
        label: "GBIF records",
        data: biodiversity.observations_by_year.map((item) => item.records),
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const taxonomyChart = {
    labels: biodiversity.taxonomic_composition.map((item) => item.kingdom),
    datasets: [
      {
        label: "Records",
        data: biodiversity.taxonomic_composition.map((item) => item.records),
        borderRadius: 6,
      },
    ],
  };

  const sourceChart = {
    labels: biodiversity.record_sources.map((item) =>
      item.type.replaceAll("_", " "),
    ),
    datasets: [
      {
        label: "Records",
        data: biodiversity.record_sources.map((item) => item.records),
        borderWidth: 0,
      },
    ],
  };

  const speciesChart = {
    labels: biodiversity.top_species.map((item) => item.name),
    datasets: [
      {
        label: "Records",
        data: biodiversity.top_species.map((item) => item.records),
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#718074",
        },
      },
      y: {
        grid: {
          color: "#edf1ed",
        },
        ticks: {
          color: "#718074",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#17351f]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#dfe7e0] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#39734a] transition hover:text-[#17351f]"
          >
            <span>←</span>
            Back to project
          </button>

          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {analytics.site_name}
                </h1>

                <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe1d1] bg-[#f0f7f1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#39734a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#39734a]" />
                  GBIF connected
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Biodiversity intelligence from spatial GBIF occurrence data
              </p>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Site
              </p>
              <p className="mt-1 text-sm font-semibold">
                #{analytics.site_id}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Overview */}
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
              Biodiversity overview
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Site intelligence
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="GBIF occurrences"
              value={formatNumber(biodiversity.total_occurrences)}
              description="Records matching the site polygon"
              badge="Spatial query"
            />

            <MetricCard
              label="Observed species"
              value={formatNumber(biodiversity.species_richness)}
              description="Unique species in the analyzed sample"
              badge="Sampled"
            />

            <MetricCard
              label="Records analyzed"
              value={formatNumber(biodiversity.records_processed)}
              description="Occurrence records processed"
              badge={`${formatNumber(biodiversity.sampling_limit)} limit`}
            />
          </div>
        </section>

        {/* Interpretation */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#e7d9ad] bg-[#fffaf0]">
          <div className="flex gap-4 p-5 sm:p-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5e8bd] text-sm font-bold text-[#8a681d]">
              i
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#6d5318]">
                How to interpret this analysis
              </h2>

              <p className="mt-1.5 max-w-4xl text-sm leading-6 text-[#7b6428]">
                GBIF reports{" "}
                <strong>
                  {formatNumber(
                    biodiversity.records_available_for_query,
                  )}
                </strong>{" "}
                matching occurrence records for this site. The dashboard
                analyzes a sample of{" "}
                <strong>
                  {formatNumber(biodiversity.records_processed)}
                </strong>{" "}
                records, so observed species richness should not be
                interpreted as a complete census of the site.
              </p>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
              Analysis
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Biodiversity signals
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Observation activity"
              description="Records represented in the analyzed sample by year."
              tag="Temporal"
            >
              <Line
                data={observationChart}
                options={chartOptions}
              />
            </ChartCard>

            <ChartCard
              title="Taxonomic composition"
              description="Distribution of analyzed records across kingdoms."
              tag="Taxonomy"
            >
              <Bar
                data={taxonomyChart}
                options={chartOptions}
              />
            </ChartCard>

            <ChartCard
              title="Record sources"
              description="How the analyzed GBIF records were classified."
              tag="Provenance"
            >
              <div className="flex h-full items-center justify-center">
                <Doughnut
                  data={sourceChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "68%",
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 18,
                          usePointStyle: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </ChartCard>

            <ChartCard
              title="Most frequently recorded species"
              description="Top species by number of records in the analyzed sample."
              tag="Species"
            >
              <Bar
                data={speciesChart}
                options={{
                  ...chartOptions,
                  indexAxis: "y",
                }}
              />
            </ChartCard>
          </div>
        </section>

        {/* Source + methodology */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-[#dfe7e0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
              Data source
            </p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-semibold">
                  Global Biodiversity Information Facility
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  Occurrence records are queried spatially using the site's
                  polygon and summarized for this analysis.
                </p>
              </div>

              <a
                href={analytics.sources.gbif.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#d5ded6] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#f7faf7]"
              >
                View GBIF ↗
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-[#17351f] p-6 text-white shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm">
              ✓
            </div>

            <h2 className="mt-4 text-sm font-semibold">
              Analysis status
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#c9d9cc]">
              Spatial biodiversity data has been retrieved and summarized
              successfully for this site.
            </p>

            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-[#91ad96]">
                Query coverage
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatNumber(biodiversity.records_available_for_query)}{" "}
                available records
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  badge,
}: {
  label: string;
  value: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe7e0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>

        <span className="rounded-lg bg-[#f1f6f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#39734a]">
          {badge}
        </span>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#17351f]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  tag,
  children,
}: {
  title: string;
  description: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe7e0] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-[#17351f]">{title}</h2>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#f4f7f3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {tag}
        </span>
      </div>

      <div className="mt-6 h-[320px]">{children}</div>
    </div>
  );
}

export default SiteAnalytics;