import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t hidden md:block">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Ebook Store</h3>
            <p className="text-sm text-gray-600">
              Your premier destination for digital books and educational resources.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/books" className="hover:text-gray-900">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="hover:text-gray-900">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gray-900">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a 
                  href="https://wa.me/6285799520350?text=Hello!%20I%20need%20assistance%20with%20your%20ebook%20store." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-900"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link href="/help" className="hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-gray-900">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-4">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Ebook Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
