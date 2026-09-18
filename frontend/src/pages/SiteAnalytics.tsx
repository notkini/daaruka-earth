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
      loadAnalytics();
    }
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f4] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading biodiversity analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#f5f7f4] p-8">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm font-medium text-emerald-700"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load analytics
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "No analytics available."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const biodiversity = analytics.biodiversity;

  const observationChart = {
    labels: biodiversity.observations_by_year.map(
      (item) => item.year,
    ),
    datasets: [
      {
        label: "GBIF records",
        data: biodiversity.observations_by_year.map(
          (item) => item.records,
        ),
        tension: 0.35,
      },
    ],
  };

  const taxonomyChart = {
    labels: biodiversity.taxonomic_composition.map(
      (item) => item.kingdom,
    ),
    datasets: [
      {
        label: "Records",
        data: biodiversity.taxonomic_composition.map(
          (item) => item.records,
        ),
      },
    ],
  };

  const sourceChart = {
    labels: biodiversity.record_sources.map(
      (item) => item.type.replaceAll("_", " "),
    ),
    datasets: [
      {
        label: "Records",
        data: biodiversity.record_sources.map(
          (item) => item.records,
        ),
      },
    ],
  };

  const speciesChart = {
    labels: biodiversity.top_species.map(
      (item) => item.name,
    ),
    datasets: [
      {
        label: "Records",
        data: biodiversity.top_species.map(
          (item) => item.records,
        ),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← Back to project
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-[#17251d]">
              {analytics.site_name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Biodiversity intelligence from GBIF occurrence data
            </p>
          </div>

          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Live GBIF data
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-5 md:grid-cols-3">
          <MetricCard
            label="GBIF occurrences"
            value={formatNumber(biodiversity.total_occurrences)}
            description="Records matching the site polygon"
          />

          <MetricCard
            label="Observed species"
            value={formatNumber(biodiversity.species_richness)}
            description="Unique species in the analyzed sample"
          />

          <MetricCard
            label="Records analyzed"
            value={formatNumber(biodiversity.records_processed)}
            description="Occurrence records processed"
          />
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 text-amber-600">ⓘ</div>

            <div>
              <h2 className="font-semibold text-amber-900">
                How to interpret this analysis
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                GBIF reports {formatNumber(
                  biodiversity.records_available_for_query,
                )} matching occurrence records for this site.
                The dashboard analyzes a sample of{" "}
                {formatNumber(biodiversity.records_processed)} records,
                so observed species richness should not be interpreted
                as a complete census of the site.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Observation activity"
            description="Records represented in the analyzed sample by year."
          >
            <Line
              data={observationChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard
            title="Taxonomic composition"
            description="Distribution of analyzed records across kingdoms."
          >
            <Bar
              data={taxonomyChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard
            title="Record sources"
            description="How the analyzed GBIF records were classified."
          >
            <div className="flex h-full items-center justify-center">
              <Doughnut
                data={sourceChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </ChartCard>

          <ChartCard
            title="Most frequently recorded species"
            description="Top species by number of records in the analyzed sample."
          >
            <Bar
              data={speciesChart}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </ChartCard>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Data source
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#17251d]">
                Global Biodiversity Information Facility
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Occurrence records queried spatially using this site's
                polygon.
              </p>
            </div>

            <a
              href={analytics.sources.gbif.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View GBIF ↗
            </a>
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
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-[#17251d]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold text-[#17251d]">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-6 h-[320px]">{children}</div>
    </div>
  );
}

export default SiteAnalytics;

