import { Outlet } from "@tanstack/react-router";
import { Footer } from "./components/footer";
import { Navbar } from "./components/navbar";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-transparent">
      <Navbar />
      <main className="flex flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
