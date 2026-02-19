import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileCartButton from "./MobileCartButton";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileCartButton />
    </div>
  );
};

export default Layout;
