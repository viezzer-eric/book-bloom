import { useState } from "react";

export const STATUS_OPTIONS = {
  scheduled: {
    label: "Agendado",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  completed: {
    label: "Concluído",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
} as const;

type StatusKey = keyof typeof STATUS_OPTIONS;

type Props = {
  status: string; // 👈 vem como string do pai
  onChange: (status: StatusKey) => void;
};

export const getStatusLabel = (status: string) => {
  return STATUS_OPTIONS[status as StatusKey]?.label ?? "Status desconhecido";
};

export default function StatusBadge({ status, onChange }: Props) {
  const [open, setOpen] = useState(false);

  // 🔒 Normaliza status vindo do pai
  const normalizedStatus: StatusKey =
    status in STATUS_OPTIONS
      ? (status as StatusKey)
      : "scheduled";

  const currentStatus = STATUS_OPTIONS[normalizedStatus];

  return (
    <div className="relative inline-block">
      {/* Badge */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1.5
          rounded-full text-xs font-medium
          cursor-pointer
          hover:opacity-90
          active:scale-95
          transition
          ${currentStatus.className}
        `}
      >
        {currentStatus.label}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {(Object.entries(STATUS_OPTIONS) as [StatusKey, typeof STATUS_OPTIONS[StatusKey]][]).map(
            ([key, opt]) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className="
                  flex items-center gap-3 w-full
                  px-4 py-3 text-sm text-left
                  hover:bg-muted
                  active:bg-muted/80
                  transition-colors
                "
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    opt.className.split(" ")[0]
                  }`}
                />
                <span className="font-medium">{opt.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
