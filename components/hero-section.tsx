import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Book, Download, Star, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                🔥 Best Digital Library
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover Your Next
                <span className="block text-yellow-300">Digital Adventure</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-lg">
                Access thousands of premium ebooks instantly. Download, read offline, and expand your knowledge today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/books">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  <Book className="mr-2 h-5 w-5" />
                  Browse Ebooks
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Users className="h-6 w-6" />
                  10K+
                </div>
                <p className="text-blue-200 text-sm">Happy Readers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Book className="h-6 w-6" />
                  5K+
                </div>
                <p className="text-blue-200 text-sm">Digital Books</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Download className="h-6 w-6" />
                  Instant
                </div>
                <p className="text-blue-200 text-sm">Download</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-gradient-to-b from-yellow-400 to-orange-500 rounded shadow-lg"></div>
                  <div>
                    <h3 className="font-semibold">Latest Release</h3>
                    <p className="text-blue-200 text-sm">Just added today</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500 text-white ml-auto">
                    NEW
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-blue-200 ml-2">(4.9) 2.1k reviews</span>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className="border-white/30 text-white">
                    Technology
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    Programming
                  </Badge>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Instant Download
                </Button>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl transform rotate-6 opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl transform -rotate-6 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
