type PasswordRequirementsProps = {
  password: string;
};

type Requirement = {
  label: string;
  valid: boolean;
};

export function getPasswordRequirements(
  password: string,
): Requirement[] {
  return [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /\d/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
    {
      label: "No spaces",
      valid: !/\s/.test(password),
    },
  ];
}

export function isPasswordStrong(password: string) {
  return getPasswordRequirements(password).every(
    (requirement) => requirement.valid,
  );
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);

  const passed = requirements.filter(
    (requirement) => requirement.valid,
  ).length;

  const strength =
    passed <= 2
      ? "Weak"
      : passed <= 4
        ? "Fair"
        : passed === 5
          ? "Good"
          : "Strong";

  const strengthWidth = `${(passed / requirements.length) * 100}%`;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password strength
        </span>

        <span
          className={`text-xs font-semibold ${
            passed === 6
              ? "text-emerald-600"
              : passed >= 4
                ? "text-amber-600"
                : "text-slate-500"
          }`}
        >
          {password ? strength : "Not set"}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: password ? strengthWidth : "0%" }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.label}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                requirement.valid
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {requirement.valid ? "✓" : "•"}
            </span>

            <span
              className={
                requirement.valid
                  ? "text-emerald-700"
                  : "text-slate-500"
              }
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}