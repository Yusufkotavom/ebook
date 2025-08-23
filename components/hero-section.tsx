import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-black text-white py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <BookOpen className="h-16 w-16 mx-auto text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Digital Books
        </h1>

        <p className="text-gray-300 mb-8 text-sm leading-relaxed">
          Discover and download your next great read instantly
        </p>

        <Button size="lg" className="w-full bg-white text-black hover:bg-gray-100">
          Browse Books
        </Button>
      </div>
    </section>
  )
}
