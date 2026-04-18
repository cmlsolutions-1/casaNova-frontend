//app/page.tsx

import { PublicHeader } from "@/components/public-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { SearchBar } from "@/components/search-bar"
import { RoomsPreview } from "@/components/rooms-preview"
import { ServicesSection } from "@/components/services-section"
import { PublicFooter } from "@/components/public-footer"
import { getHeroImages } from "@/lib/hero-images"
import { LocationSection } from "@/components/location-section"
import { ServicesOtherDay } from "@/components/services-otherday"
import { ZonaSocialSection } from "@/components/zonaSocial-section"

export default function Page() {
  const images = getHeroImages()
  
  return (
    <main>
      <PublicHeader />
      
      <HeroCarousel images={images} />
      
      <section id="search">
        <SearchBar />
      </section>

      <section id="rooms">
        <RoomsPreview />
      </section>

      <section id="services">
        <ServicesSection />
      </section>

      <section id="otros-servicios">
        <ServicesOtherDay />
      </section>

      <section id="zonas-sociales">
        <ZonaSocialSection />
      </section>
      <section id="ubicacion">
        <LocationSection />
      </section>

      <PublicFooter />
    </main>
  )
}
