'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function BookingFailurePage() {
  const searchParams = useSearchParams();

  const data = useMemo(() => {
    const getValue = (key: string) => {
      const value = searchParams.get(key);
      return value && value !== 'null' ? value : null;
    };

    return {
      reservationId: getValue('reservationId'),
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle className="h-10 w-10" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Pago no completado
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          El proceso fue cancelado o no pudo finalizarse. Puedes intentarlo
          nuevamente desde tu reserva.
        </p>

        {data.reservationId && (
        <div className="mt-4 space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Reserva
            </p>
            <p className="text-sm font-medium text-slate-700 break-all">
            {data.reservationId}
            </p>
            <p className="text-xs text-red-500">No efectuada</p>
        </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}