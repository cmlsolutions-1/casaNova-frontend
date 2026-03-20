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
      <SearchBar />
      <RoomsPreview />
      <ServicesSection />
      <ServicesOtherDay />
      <ZonaSocialSection />
      <LocationSection />
      <PublicFooter />
    </main>
  )
}
