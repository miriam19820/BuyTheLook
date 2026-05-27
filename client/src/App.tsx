import { useState } from "react";

type Recommendation = {
  product_id: string;
  name: string;
  price: number;
  explanation: string;
};

function App() {
  const [age, setAge] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [occasion, setOccasion] = useState("work_from_home");
  const [stylePreferences, setStylePreferences] = useState("");
  const [favoriteColors, setFavoriteColors] = useState("");
  const [avoidColors, setAvoidColors] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResults([]);

    if (!age || !budgetMax || !occasion) {
      setError("Please fill in age, budget, and occasion.");
      return;
    }

    const profile = {
      user_id: `user_${Date.now()}`,
      age: Number(age),
      style_preferences: parseList(stylePreferences),
      favorite_colors: parseList(favoriteColors),
      avoid_colors: parseList(avoidColors),
      occasion,
      budget_max: Number(budgetMax),
    };

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ use_ai: useAI, profile }),
      });

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          payload?.message ||
            `Server responded with status ${response.status}`
        );
      }

      const data = await response.json();
      if (!data?.success || !Array.isArray(data.data)) {
        throw new Error("Unexpected response format from server.");
      }
      setResults(data.data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to reach the recommendation service."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              BuyTheLook
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Personal styling made effortless
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Share your vibe, budget and occasion, and get curated fashion
              recommendations with a chic explanation for every pick.
            </p>
          </div>
        </header>

        <main className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-200/60">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Your style profile
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Fill in the essentials and choose whether to let AI add a
                little magic.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Age
                  </span>
                  <input
                    type="number"
                    min={13}
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="32"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Budget max
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={budgetMax}
                    onChange={(event) => setBudgetMax(event.target.value)}
                    placeholder="300"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Occasion
                </span>
                <select
                  value={occasion}
                  onChange={(event) => setOccasion(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="work_from_home">Work from home</option>
                  <option value="weekend">Weekend</option>
                  <option value="errands">Errands</option>
                  <option value="date_night">Date night</option>
                  <option value="party">Party</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Style preferences
                </span>
                <input
                  type="text"
                  value={stylePreferences}
                  onChange={(event) => setStylePreferences(event.target.value)}
                  placeholder="casual, minimalist"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Favorite colors
                </span>
                <input
                  type="text"
                  value={favoriteColors}
                  onChange={(event) => setFavoriteColors(event.target.value)}
                  placeholder="black, white"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Avoid colors
                </span>
                <input
                  type="text"
                  value={avoidColors}
                  onChange={(event) => setAvoidColors(event.target.value)}
                  placeholder="neon_yellow"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Use AI Magic
                  </p>
                  <p className="text-xs text-slate-500">
                    Let the service add a smarter explanation to each pick.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAI((current) => !current)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full p-1 transition ${
                    useAI ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      useAI ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? "Finding your look..." : "Reveal my recommendations"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-200/60">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Recommendations
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your top 5 curated products will appear here after submission.
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                Loading recommendations…
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                No recommendations yet. Submit your profile to see styled
                picks.
              </div>
            ) : (
              <div className="space-y-5">
                {results.map((item) => (
                  <article
                    key={item.product_id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        Styled pick
                      </span>
                    </div>
                    <p className="mt-4 text-slate-600">{item.explanation}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;