import { PublicHeader } from "@/components/public-header"
import { HeroCarousel } from "@/components/hero-carousel"
import { SearchBar } from "@/components/search-bar"
import { RoomsPreview } from "@/components/rooms-preview"
import { ServicesSection } from "@/components/services-section"
import { PublicFooter } from "@/components/public-footer"

export default function Page() {
  return (
    <main>
      <PublicHeader />
      <HeroCarousel />
      <SearchBar />
      <RoomsPreview />
      <ServicesSection />
      <PublicFooter />
    </main>
  )
}
