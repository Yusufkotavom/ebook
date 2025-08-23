import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to public routes
  const publicRoutes = ["/", "/auth/login", "/auth/sign-up", "/auth/check-email", "/checkout", "/order-confirmation"]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect unauthenticated users trying to access protected dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user && request.nextUrl.pathname !== "/admin/login") {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    // Check admin privileges for authenticated users accessing admin routes
    if (user && request.nextUrl.pathname !== "/admin/login") {
      const { data: adminData } = await supabase.from("admin_users").select("id").eq("id", user.id).single()

      if (!adminData) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
