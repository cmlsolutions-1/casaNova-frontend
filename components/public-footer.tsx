import { Hotel, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="h-6 w-6 text-accent" />
              <span className="font-serif text-xl font-bold">Casa Nova</span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Donde el lujo se encuentra con la serenidad. Una experiencia unica de hospitalidad
              y confort desde 1985.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">
              Enlaces
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/#rooms" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                Habitaciones
              </Link>
              <Link href="/#services" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                Servicios
              </Link>
              <Link href="/#search" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                Reservar
              </Link>
              <Link href="/admin/login" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                Administracion
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">
              Contacto
            </h4>
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-accent" />
                Av. del Mar 1234, Cartagena
              </span>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 text-accent" />
                +57 (5) 660 1234
              </span>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 text-accent" />
                info@grandluxehotel.com
              </span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} Casa Nova Hotel Campestre. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
