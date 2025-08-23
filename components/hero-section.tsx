import { Button } from "@/components/ui/button"
import { BookOpen, Download, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">Discover Your Next Great Read</h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our curated collection of digital books from renowned authors and publishers. Instant downloads,
            competitive prices, and a reading experience like no other.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Browse Catalog
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600 text-sm">Get your books immediately after purchase</p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Content</h3>
              <p className="text-gray-600 text-sm">Curated selection from top publishers</p>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Reading</h3>
              <p className="text-gray-600 text-sm">Compatible with all devices and readers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
