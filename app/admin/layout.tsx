"use client"

import type React from "react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user && pathname !== "/admin/login") {
    return null
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <span className="mr-2">🏠</span>
                메인으로
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛡️</span>
              <div>
                <h1 className="text-lg font-semibold">B-LINK 관리자</h1>
                <p className="text-xs text-muted-foreground">보령LNG 통합 출입 관리 시스템</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.username})
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <span className="mr-2">🚪</span>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/30">
        <div className="container">
          <div className="flex space-x-6 py-2">
            <Button
              variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
              size="sm"
              asChild
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Link href="/admin/dashboard">
                <span className="mr-2">📊</span>
                대시보드
              </Link>
            </Button>
            <Button
              variant={pathname === "/admin/requests" ? "default" : "ghost"}
              size="sm"
              asChild
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Link href="/admin/requests">
                <span className="mr-2">📋</span>
                신청 관리
              </Link>
            </Button>
            <Button
              variant={pathname === "/admin/calendar" ? "default" : "ghost"}
              size="sm"
              asChild
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Link href="/admin/calendar">
                <span className="mr-2">📅</span>
                방문 캘린더
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}
