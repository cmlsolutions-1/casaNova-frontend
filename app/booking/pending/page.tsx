// app/booking/pending/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, Home, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Componente hijo que usa useSearchParams
function BookingPendingContent() {
  const searchParams = useSearchParams();

  const data = useMemo(() => {
    const getValue = (key: string) => {
      const value = searchParams.get(key);
      return value && value !== 'null' ? value : null;
    };

    return {
      reservationId: getValue('reservationId'),
      paymentId: getValue('payment_id'),
      status: getValue('status'),
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Clock className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Pago en proceso
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tu pago está siendo verificado. Esto puede tardar unos minutos.
          Recibirás una confirmación por WhatsApp una vez se complete.
        </p>

        {(data.reservationId || data.paymentId) && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left">
            {data.reservationId && (
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Reserva</p>
                <p className="text-sm font-medium text-slate-700 break-all">{data.reservationId}</p>
              </div>
            )}
            {data.paymentId && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Pago MP</p>
                <p className="text-sm font-medium text-slate-700 break-all">{data.paymentId}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
          
          <p className="text-xs text-slate-400">
            ¿Problemas con tu pago? Contacta a soporte.
          </p>
        </div>
      </div>
    </main>
  );
}

// Página principal con Suspense
export default function BookingPendingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-spin text-accent" />
          <p className="text-slate-500">Cargando estado del pago...</p>
        </div>
      </div>
    }>
      <BookingPendingContent />
    </Suspense>
  );
}